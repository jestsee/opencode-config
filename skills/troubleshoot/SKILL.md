---
name: troubleshoot
description: Known bugs, quirks, and their fixes discovered during development
version: 1.0.0
license: MIT
---

Use this skill when debugging issues that may have known solutions. Check here before investigating from scratch.

## React Native + @expo/ui

### Nested Pressable + native SwiftUI Menu

When a `Pressable` from `react-native` wraps a native SwiftUI `Menu` (`@expo/ui/swift-ui`), tapping the menu fires both the native menu **and** the outer `onPress`. `stopPropagation()` does not work because the native SwiftUI touch handling bypasses React Native's event system.

**Fix**: Import `Pressable` from `react-native-gesture-handler` instead of `react-native` for the outer pressable. The RNGH version properly blocks event propagation to parent handlers when a child native view handles the touch.

```tsx
// Before (broken — both handlers fire)
import { Pressable } from "react-native";

<Pressable onPress={() => navigate()}>
  <Menu label={<RNHostView>...</RNHostView>}>
    ...
  </Menu>
</Pressable>

// After (works — only menu opens)
import { Pressable } from "react-native-gesture-handler";

<Pressable onPress={() => navigate()}>
  <Menu label={<RNHostView>...</RNHostView>}>
    ...
  </Menu>
</Pressable>
```

**Reference**: `app/(tabs)/saved/my-sessions.tsx` — list item with three-dot dropdown menu.
