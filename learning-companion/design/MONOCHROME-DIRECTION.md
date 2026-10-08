# Monochrome learning lab — current direction

7 October 2026. Supersedes the orange/green workshop palette. The user explicitly prefers black and rejected the previous dark contrast.

## References

- [Hoplite](https://hoplite.sh): inspected live and captured `references/hoplite-desktop.png`. Adopt generous composition, grayscale depth and raised controls. Exclude orange per user preference. No proprietary logo/asset is reused.
- [Apple app icon guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons): clear silhouette, legibility at small sizes and platform masking.
- [Apple Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer): layering reference. These assets are SVG/PNG, not a native Icon Composer file.
- [UIArc buttons](https://uiarc.dev/components/button): previously studied press/selection/disclosure behavior retained.

## Visual rules

Black #000000 background, #101010 cards, #141414 hero, #333333 borders, #F5F5F5 text, #A6A6A6 secondary text. White primary controls with black labels. Neutral white/silver light mode. No orange/green/ochre chapter backgrounds. Error colors remain semantic. Existing preferences persist; new installations default to dark.

The original logo combines an open book and ascending folded planes: a page becoming a path. Silver on black for the app icon; flat silhouette for the header and Android monochrome icon. Source vectors live in `assets/brand/`; regenerate with `node scripts/make-brand-assets.mjs`.

Native rendering, notification delivery and hardware performance need separate validation. Browser evidence does not establish those claims. See `../VALIDATION.md`.

Measured opaque text-token contrast: primary dark text 17.45:1 (#F5F5F5/#101010); secondary dark text 6.38:1 (#A6A6A6/#242424); secondary light text 4.85:1 (#606060/#E2E2E2); primary action label 18.21:1 (#080808/#F4F4F4). These cover the listed token pairs, not a claim that every composited/disabled state has been audited.
