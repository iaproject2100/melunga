"""Administrative client checks; no network calls or real credentials."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import unittest
from unittest import mock
import urllib.error
import urllib.request

spec = importlib.util.spec_from_file_location("shared_contact", Path(__file__).with_name("shared_contact.py"))
client = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client)


class SharedContactTests(unittest.TestCase):
    def test_only_expected_https_destinations(self):
        for base in ("https://melunga.com", "https://deploy-preview-12--chic-dragon-e2baf2.netlify.app/"):
            self.assertTrue(client.endpoint(base).endswith("/.netlify/functions/admin-shared-access"))
        for base in ("http://melunga.com", "https://melunga.com.evil.test", "https://evil.test",
                     "https://melunga.com@evil.test", "https://user:pass@melunga.com",
                     "https://melunga.com:443", "https://melunga.com/path", "https://melunga.com?q=a",
                     "https://melunga.com#fragment", "https://deploy-preview-12--else.netlify.app"):
            with self.subTest(base=base), self.assertRaises(ValueError):
                client.endpoint(base)

    def test_redirect_refused_before_credentials_leave_origin(self):
        req = urllib.request.Request("https://melunga.com", headers={"Authorization": "Bearer fictitious"})
        with self.assertRaises(urllib.error.URLError):
            client.NoRedirect().redirect_request(req, None, 302, "Found", {}, "https://elsewhere.test")

    def test_missing_admin_configuration_never_calls_network(self):
        with mock.patch.dict(os.environ, {}, clear=True), mock.patch.object(sys, "argv", ["cli", "inspect"]), \
                mock.patch.object(client, "request") as request, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(client.main(), 1)
            request.assert_not_called()

    def test_inspection_never_prompts_for_password(self):
        result = {"success": True, "state": {"revision": "r1", "exists": False}}
        with mock.patch.dict(os.environ, {"MELUNGA_ADMIN_SECRET": "fictitious-admin"}), \
                mock.patch.object(sys, "argv", ["cli", "inspect"]), \
                mock.patch.object(client, "request", return_value=result) as request, \
                mock.patch.object(client.getpass, "getpass") as prompt, contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(client.main(), 0)
            prompt.assert_not_called()
            self.assertEqual(request.call_args.args[1], {"action": "inspect"})

    def test_activation_requires_inspection_and_interactive_terminal(self):
        for extra in ([], ["--expected-revision", "absent"]):
            with mock.patch.dict(os.environ, {"MELUNGA_ADMIN_SECRET": "fictitious-admin"}), \
                    mock.patch.object(sys, "argv", ["cli", "activate", *extra]), \
                    mock.patch.object(sys.stdin, "isatty", return_value=False), \
                    mock.patch.object(client, "request") as request, \
                    mock.patch.object(client.getpass, "getpass") as prompt, contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(client.main(), 1)
                prompt.assert_not_called()
                request.assert_not_called()

    def test_activation_prompts_without_printing_or_saving_password(self):
        out, err = io.StringIO(), io.StringIO()
        result = {"success": True, "changed": True, "state": {"permanent": True, "deviceLimit": 30}}
        with mock.patch.dict(os.environ, {"MELUNGA_ADMIN_SECRET": "fictitious-admin"}), \
                mock.patch.object(sys, "argv", ["cli", "activate", "--expected-revision", "r1", "--request-id", "fixture-operation"]), \
                mock.patch.object(sys.stdin, "isatty", return_value=True), \
                mock.patch.object(client.getpass, "getpass", return_value="Fictitious-Password"), \
                mock.patch.object(client, "request", return_value=result) as request, \
                contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            self.assertEqual(client.main(), 0)
        self.assertEqual(request.call_args.args[1], {"action": "activate", "expectedRevision": "r1",
                         "requestId": "fixture-operation", "password": "Fictitious-Password"})
        self.assertNotIn("Fictitious-Password", out.getvalue() + err.getvalue())
        self.assertNotIn("fictitious-admin", out.getvalue() + err.getvalue())
        self.assertIn("fixture-operation", err.getvalue())

    def test_response_output_excludes_unexpected_credentials(self):
        output = client.safe_output({"success": True, "token": "secret", "state": {
            "email": "contact@melunga.com", "passwordHash": "secret", "salt": "secret", "revision": "r2"}})
        self.assertNotIn("secret", json.dumps(output))
        self.assertEqual(output["state"]["revision"], "r2")

    def test_http_errors_do_not_print_provider_body_or_secret(self):
        opener = mock.Mock()
        error = urllib.error.HTTPError("https://melunga.com", 503, "Unavailable", {},
                                       io.BytesIO(b'{"error":"provider secret"}'))
        opener.open.side_effect = error
        with mock.patch.object(urllib.request, "build_opener", return_value=opener), \
                self.assertRaisesRegex(RuntimeError, r"HTTP 503 : request_failed$"):
            client.request("https://melunga.com", {"action": "inspect"}, "fictitious-admin")

    def test_successful_request_preserves_proxy_route_and_uses_header(self):
        response = io.BytesIO(b'{"success":true,"state":{"exists":false}}')
        opener = mock.Mock()
        opener.open.return_value = response
        with mock.patch.object(urllib.request, "build_opener", return_value=opener):
            result = client.request("https://melunga.com", {"action": "inspect"}, "fictitious-admin")
        req = opener.open.call_args.args[0]
        self.assertEqual(req.get_header("Authorization"), "Bearer fictitious-admin")
        self.assertEqual(json.loads(req.data), {"action": "inspect"})
        self.assertTrue(result["success"])


if __name__ == "__main__":
    unittest.main()
