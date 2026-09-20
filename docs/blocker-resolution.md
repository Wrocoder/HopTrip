# Blocker resolution checklist

This checklist turns the open external decisions into concrete actions. Do not commit
`.env`, `.env.production`, API tokens, private keys or payment details.

## 1. Travelpayouts data access and affiliate account

1. Open [Travelpayouts](https://www.travelpayouts.com) and create an account.
2. Verify the email address.
3. Create a Project for the HopTrip website. Use the production domain when it exists;
   add Telegram as a separate Project later if it will be a separate traffic source.
4. Open **My Programs** and select a flight program that permits Polish traffic and the
   channels you intend to use. Save the program code/ID and its current status.
5. Open **Profile → API token** and copy the token into the local `.env` or production
   `.env.production` as `TRAVELPAYOUTS_API_TOKEN`. Do not regenerate the token after
   deployment unless every environment is updated: the old token becomes invalid.
6. For the selected program, record whether it supports deep links, the exact target URL
   format, the project/`trs` identifier, the partner marker, and the supported sub-ID
   parameter. We need these values to populate each deal component's `outbound_url`.
7. Read the program's traffic and attribution rules. Save the program terms or a link to
   them for the project record.

If a program is under review or unavailable, use the Help Center's **Submit a request**
form or email `support@travelpayouts.com`. Include the project URL, traffic sources,
Polish audience, expected integration method, and the exact questions below. Never include
the API token in the request:

```text
Subject: HopTrip flight-deal website: API, deep links and conversion tracking

Hello,

I am building HopTrip, a Polish flight-deal website at <PROJECT_URL>.
Traffic will come from the website and, later, a separate Telegram project.

Please confirm:
1. Which flight programs may be used for Polish traffic and these channels?
2. Is the cached data API enabled for my account and what are the rate limits?
3. Which deep-link endpoint or link format should be used for flight searches?
4. What are the project/marker identifiers and the supported sub-ID parameter?
5. Is conversion reporting available through an API or webhook, and which fields identify
   the sub-ID and booking?
6. Which attribution, disclosure and promotion rules apply?

Thank you.
```

References:

- [Travelpayouts quick start](https://support.travelpayouts.com/hc/en-us/articles/11394852618642-How-to-use-Travelpayouts-Quick-Start-Guide)
- [How programs are connected](https://support.travelpayouts.com/hc/en-us/articles/360021216060-How-to-start-working-with-affiliate-programs)
- [Where to find the API token](https://support.travelpayouts.com/hc/en-us/articles/13024069738386-Where-to-find-API-token)
- [Partner-link API](https://support.travelpayouts.com/hc/en-us/articles/25289759198226-API-for-Travelpayouts-partner-links)
- [Support contact](https://support.travelpayouts.com/hc/en-us/articles/11680481443730-How-to-contact-Travelpayouts-support)

## 2. Currency policy

Until a policy is accepted, the application intentionally accepts PLN only. The lowest
friction option is the ECB daily reference-rate API, which does not require an API key:

1. Decide that non-PLN observations are converted to PLN using the latest available ECB
   daily reference rate for the observation date.
2. Decide what happens on weekends or missing dates: use the latest prior ECB rate, or
   reject the observation.
3. Decide rounding (the recommended display/storage precision is two decimal places).
4. Confirm the chosen policy in the project issue or message so the converter can be enabled.

The source is [ECB Data Portal API documentation](https://data.ecb.europa.eu/help/api/data);
the exchange-rate dataflow is `EXR`.

## 3. Oracle VM, DNS and TLS

1. Create or sign in to an [Oracle Cloud account](https://www.oracle.com/cloud/free/).
   Choose the home region carefully because Always Free compute availability is tied to it.
2. In **Compute → Instances**, create a Linux VM. Use the VCN wizard, assign a public IPv4
   address, and upload an SSH public key. Keep the private key only on your computer.
3. In the subnet security rules, allow TCP `22` only from your own fixed IP if possible.
   Allow TCP `80` and `443` from `0.0.0.0/0` and `::/0` if IPv6 is enabled. Do not expose
   PostgreSQL `5432`, API `8000` or web `3000`.
4. At the domain registrar, add an `A` record for the chosen host (for example
   `deals.example.com`) pointing to the VM public IP. Add an `AAAA` record only when IPv6
   is configured and tested. If DNS is managed by OCI, create a public zone and delegate it
   at the registrar.
5. SSH into the VM, install Docker Engine and the Compose plugin, clone the repository, and
   copy `.env.production.example` to `.env.production`.
6. Fill the production file with the domain, ACME email, a URL-safe database password, a
   long admin token, the Travelpayouts token and the approved affiliate host.
7. Run the validation and deployment commands from `docs/operations.md`.
8. After HTTPS is issued, run one backup and a restore drill during a maintenance window.

Use Oracle documentation for [creating an instance](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm),
[security lists](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm)
and [public DNS](https://docs.oracle.com/en-us/iaas/Content/DNS/Concepts/dnszonemanagement.htm).
Contact Oracle support from the OCI Console for account, quota or capacity problems. Contact
the domain registrar only for registrar or DNS delegation issues.

## 4. What to send back after completing the external steps

Send only non-secret values:

- production domain;
- Travelpayouts program name/code and project/marker identifiers;
- approved affiliate host;
- exact sub-ID parameter;
- link to program terms;
- accepted currency policy;
- VM public IP and SSH username, if deployment assistance is needed.

Keep API tokens, passwords, private keys and payment details on the machine where they are
used. Once the values above are available, the remaining work is to implement the provider
link builder, run the real-data acceptance pipeline, connect the conversion feed, deploy the
stack and complete the restore drill.
