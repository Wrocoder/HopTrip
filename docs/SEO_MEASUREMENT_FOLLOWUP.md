# Completing the external SEO checks

Implementation and a successful deployment do not establish Google index status or ranking growth.

## Search Console URL Inspection

For the priority airport pages, /from/KRK, /routes/krakow-rome and the weekend landing, record: inspection date, whether the URL is indexed, last crawl time, user-declared canonical and Google-selected canonical. Public HTTP/robots/sitemap checks only establish technical eligibility. Do not use site: search or a page-view analytics event as proof that a URL is indexed.

The intentionally noindex /destinations/rome and filtered search URLs should keep their policy unless a separate indexing decision is made. Do not remove noindex to satisfy an audit assumption.

## Before/after data

Export GSC performance with matching search type, country/device filters and comparable non-overlapping windows, normally 28 days before and after recrawl. Record the release and subsequent crawl date; account for seasonality and changing query mix. The initial supplied export contains 42 daily rows. Its per-page aggregates cannot be retroactively trimmed to 28 days using the separate daily chart: obtain the appropriately filtered export for a page-level 28-day comparison.

Run from the repository root in PowerShell:

```powershell
./scripts/seo/Compare-SearchConsole.ps1 -BeforeZip ./before.zip -AfterZip ./after.zip -OutputPath ./comparison.json
```

The tool accepts Russian/English GSC filenames and invariant numeric values, computes weighted chart position and CTR, and reports page/query/country/device breakdown totals separately. It flags unequal or overlapping date windows. Verify matching filters manually; a valid window is not proof of causality. Identical-input self-check on the provided export recovered 6 clicks, 733 property impressions, 42 days and zero deltas, and correctly rejected the overlapping windows as a valid before/after comparison.

Use fixed priority pages and recurring non-brand queries, with country/device segmentation where data is available. Small samples and anonymized queries limit inference. Existing consented PAGE_VIEW/page_type and SEARCH_RESULT can describe broad guide/catalog engagement; the current contract does not identify a precise click on each guide link. Do not claim that attribution or introduce a parallel tracker without a separate contract.

## Performance

Three production pages have mobile Lighthouse lab baselines. Repeat under comparable conditions; record raw reports and variability. Scores, LCP/CLS/TBT from a lab run do not replace real-user LCP/INP/CLS percentiles. Public PageSpeed access returned 429 in this session; this establishes unavailable access, not absence of CrUX data for the website. Obtain field data through authorized Search Console/PageSpeed/CrUX access when available.

Stage 1 remains open until the URL Inspection evidence exists. Stage 7 remains open until post-recrawl data can be evaluated. These external gates should not be renamed or counted as completed development tasks.
