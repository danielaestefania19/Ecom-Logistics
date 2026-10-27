-- Portal billing line → existing Stripe product, so invoice drafts use the catalog (and Stripe
-- reports by product) instead of free-text lines. Read by the stripe-billing function.
insert into public.portal_config (key, value) values (
  'stripe_products',
  '{"prep_standard":"prod_S1w8lK8uUatc0O","prep_oversize":"prod_SAtMpAct2lih8z","prep_polybag":"prod_SAtP3B1HRJ4bZg","prep_bubble":"prod_SAtRcdg7k5UHi2","prep_bundle":"prod_SAtV0wfdy3ckMb","case_receiving":"prod_SAu9yjQjNKPNAn","pallet_receiving":"prod_SAuASac5rb77km","pallet_standard":"prod_SAuKFu8cihsbFa","pallet_wrap":"prod_SAuMsSopAPgYhx","coupon_insert":"prod_SAuDvXIkS65Ebq","filler":"prod_SAuFHVtFD9cH1g","pick_small_medium_box":"prod_SAtgC0xkLOddKu","pick_large_box":"prod_SAu0li2tSYX9YW","pick_bubble_mailer":"prod_SAu2jAY9AyfWD6","pick_poly_mailer":"prod_SAu3gun6EVDD5n","storage_pallet":"prod_SAvBYvSPa8UK3G"}'
) on conflict (key) do update set value = excluded.value;
