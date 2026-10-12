<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Ghostline architecture
- Keep all content and identity interactions in the isolated in-memory mock service and GhostProvider until Cloud integration; browser storage stores only onboarding and appearance preferences, never authoritative post data.
- Use shared Ghostline components with semantic CSS tokens for every route so light, dark, and system appearance stay consistent.
- Every public content route declares its own pageHead metadata; keep the home feed at `/` and use TanStack routes for discovery and post details.
- Filter unavailable content centrally and recheck parent expiration when mutating replies or reactions; prototype filtering is not production deletion enforcement.
- Keep additional discovery categories in the presentation topic catalog; reuse it for composing and filtering without changing content availability rules.
