#!/usr/bin/env python3
"""Inspect, then activate the owner's shared account. Never writes credentials."""
import argparse
import getpass
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Administrative credentials must never follow an unexpected redirect.
        raise urllib.error.URLError("redirect_refused")


def endpoint(base):
    parsed = urllib.parse.urlsplit(base)
    host = parsed.hostname or ""
    if (parsed.scheme != "https" or parsed.username or parsed.password or parsed.port
            or parsed.path not in ("", "/") or parsed.query or parsed.fragment
            or not (host == "melunga.com" or re.fullmatch(
                r"deploy-preview-[0-9]+--chic-dragon-e2baf2\.netlify\.app", host))):
        raise ValueError("Utiliser melunga.com ou l’aperçu Netlify de ce projet, en HTTPS.")
    return f"https://{host}/.netlify/functions/admin-shared-access"


def request(url, body, secret):
    payload = json.dumps(body).encode()
    req = urllib.request.Request(url, data=payload, method="POST", headers={
        "Content-Type": "application/json", "Authorization": "Bearer " + secret
    })
    try:
        opener = urllib.request.build_opener(NoRedirect())
        with opener.open(req, timeout=30) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        try:
            code = json.load(error).get("error", "request_failed")
            if not isinstance(code, str) or not re.fullmatch(r"[a-z_]+", code):
                code = "request_failed"
        except Exception:
            code = "request_failed"
        raise RuntimeError(f"HTTP {error.code} : {code}") from None
    except (urllib.error.URLError, json.JSONDecodeError):
        raise RuntimeError("Connexion administrative indisponible ou réponse invalide.") from None
    if not isinstance(result, dict) or result.get("success") is not True:
        raise RuntimeError("Opération non confirmée.")
    return result


def safe_output(result):
    state = result.get("state", {})
    allowed = ("email", "exists", "revision", "permanent", "accessActive", "deviceLimit",
               "registeredDevices", "canActivate", "blocker", "subscriptionPlan", "subscriptionExpiry")
    return {"success": True, "changed": result.get("changed"),
            "state": {key: state[key] for key in allowed if key in state}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("inspect", "activate"))
    parser.add_argument("--base-url", default="https://melunga.com")
    parser.add_argument("--expected-revision")
    parser.add_argument("--request-id")
    args = parser.parse_args()
    try:
        url = endpoint(args.base_url)
        secret = os.environ.get("MELUNGA_ADMIN_SECRET", "")
        if not secret:
            raise RuntimeError("Configurer MELUNGA_ADMIN_SECRET dans l’environnement sécurisé.")
        body = {"action": args.action}
        if args.action == "activate":
            if not args.expected_revision:
                raise ValueError("Inspecter d’abord, puis fournir --expected-revision.")
            if not sys.stdin.isatty():
                raise ValueError("Activation depuis un terminal : le mot de passe est demandé sans affichage.")
            body.update(expectedRevision=args.expected_revision,
                        requestId=args.request_id or str(uuid.uuid4()),
                        password=getpass.getpass("Mot de passe du compte partagé (non enregistré) : "))
        if args.action == "activate":
            # Non-secret identifier, printed before the request so a retry after
            # a lost response can reuse the same id without activating twice.
            print("Identifiant de l’opération : " + body["requestId"], file=sys.stderr)
        result = request(url, body, secret)
        print(json.dumps(safe_output(result), ensure_ascii=False, indent=2))
        return 0
    except (ValueError, RuntimeError, EOFError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
