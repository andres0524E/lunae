create policy "Anyone can read jewelry photos" on storage.objects for select to anon, authenticated
  using (bucket_id = 'jewelry');
create policy "Admins upload jewelry photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'jewelry' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update jewelry photos" on storage.objects for update to authenticated
  using (bucket_id = 'jewelry' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete jewelry photos" on storage.objects for delete to authenticated
  using (bucket_id = 'jewelry' and public.has_role(auth.uid(), 'admin'));