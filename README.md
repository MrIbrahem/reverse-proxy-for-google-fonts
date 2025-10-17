# Full Local Reverse Proxy Setup for `fonts.gstatic.com` Using IIS on Windows

> **Note:** In Yemen, the domain `fonts.gstatic.com` is blocked by the main ISP **YemenNet**.

This setup provides a **local HTTPS reverse proxy** that bypasses the block by redirecting requests to an alternative backend (e.g. Vercel) through your own machine.

After completing these steps, you’ll be able to visit:

[https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2](https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2)

and get the content from your chosen backend (e.g. a Vercel proxy), entirely through your local IIS.

---

## 1. Open IIS Manager
Launch the **Internet Information Services (IIS)** Manager on Windows.

---

## 2. Install Required Modules
Install the following IIS extensions (via Web Platform Installer or manual download):

- **URL Rewrite**
- **Application Request Routing (ARR)**

---

## 3. Enable Proxy in ARR
1. In IIS Manager, select the **server node** (not a specific site).  
2. Open **Application Request Routing Cache**.  
3. In the right panel, click **Server Proxy Settings**.  
4. Check **Enable Proxy** and click **Apply**.

---

## 4. Create a Local Site
1. In IIS Manager, right-click **Sites → Add Website**.  
2. Fill in:
   - **Type:** `http`
   - **Host name:** `fonts.gstatic.com`
   - **Port:** `80`
   - **Physical path:** any empty folder (e.g. `C:\inetpub\fonts-proxy`)

---

## 5. Edit Hosts File
Add this line to `C:\Windows\System32\drivers\etc\hosts`:

```

127.0.0.1   fonts.gstatic.com

````

This redirects `fonts.gstatic.com` to your local IIS.

---

## 6. Generate a Self-Signed SSL Certificate
Open **PowerShell as Administrator** and run:

```powershell
New-SelfSignedCertificate -DnsName "fonts.gstatic.com" -CertStoreLocation "cert:\LocalMachine\My"
````

---

## 7. Enable HTTPS Binding for the Site

1. Go back to your site’s **Bindings**.
2. Add a new binding:

   * **Type:** `https`
   * **Host name:** `fonts.gstatic.com`
   * **Port:** `443`
   * **SSL certificate:** select the certificate you just generated.
3. Click **OK**.

---

## 8. Add Reverse Proxy Rule

1. With the site selected, open **URL Rewrite**.
2. Click **Add Rule(s)…** → choose **Reverse Proxy**.
3. In the inbound proxy destination, enter:

```
v0-reverse-proxy-for-google-fonts.vercel.app
```

4. Save the rule.

---

## 9. Trust the Certificate in Windows

1. Run `certmgr.msc`.
2. Go to **Personal → Certificates**.
3. Copy the `fonts.gstatic.com` certificate.
4. Paste it into **Trusted Root Certification Authorities → Certificates**.

---

## 10. Export and Import the Certificate into Chrome

Even after trusting the certificate, Chrome may still warn that the connection is not secure. To fix this:

1. Open `https://fonts.gstatic.com` in Chrome.
2. Click the **Not secure** icon → view certificate details.
3. Export the certificate to your Desktop.
4. Open `chrome://certificate-manager/localcerts/usercerts`.
5. Import the exported certificate into **Trusted Certificates**.

---

## 11. Test

Visit:

```
https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2
```

The request will go through your **local IIS reverse proxy**, which then fetches from `v0-reverse-proxy-for-google-fonts.vercel.app`.

---

## ✅ Result

* All `fonts.gstatic.com` requests are intercepted locally.
* HTTPS is supported via self-signed certificate.
* Browsers trust the local certificate after importing it.
* You can use the local mirror transparently without modifying HTML/CSS font URLs.

---

