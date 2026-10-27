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

## Project rules
- Catalog data lives in the `jewelry` table; public RLS hides `vendida` rows, admins (via `user_roles` + `has_role`) see and edit all. Why: sold pieces must vanish from the public catalog without deletion.
- The first account ever created becomes admin through an `auth.users` trigger; later signups get no role. Why: single-owner shop with no admin UI for roles.
- Photos go to the private `jewelry` storage bucket and are shown via signed URLs (`src/lib/jewelry.ts`). Why: workspace blocks public buckets.
- WhatsApp number and message building live only in `src/lib/whatsapp.ts` (covered by `src/test/whatsapp.test.ts`).
