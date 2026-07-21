DROP POLICY IF EXISTS "own planilha" ON public.planilha_items;

CREATE POLICY "planilha select authenticated"
  ON public.planilha_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "planilha insert own"
  ON public.planilha_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "planilha update own"
  ON public.planilha_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "planilha delete own"
  ON public.planilha_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);