---
name: widget-custom-fonts
description: Bundle custom fonts into iOS widget extensions (expo-widgets) — expo-font only covers the main app target, not the widget extension
version: 1.0.0
license: MIT
---

Use this skill when adding custom fonts to iOS home screen widgets built with `expo-widgets`. The standard `expo-font` plugin only bundles fonts into the **main app target** — the widget extension is a separate binary that needs its own font resources.

## The Problem

`expo-font`'s config plugin (`withFontsIos`) does two things:
1. Adds `.ttf` files to the main app's Xcode Resources group + `PBXResourcesBuildPhase`
2. Registers font names in the main app's `Info.plist` under `UIAppFonts`

But `expo-widgets` creates a **separate Xcode target** (`ExpoWidgetsTarget`) with its own Info.plist and build phases — and it does **not** create a `PBXResourcesBuildPhase` for that target. So fonts bundled via `expo-font` are invisible to widgets.

## The Solution

A custom config plugin (`plugins/with-widget-fonts.ts`) that:
1. Copies `.ttf` files into `ios/ExpoWidgetsTarget/`
2. Adds `UIAppFonts` to the widget's `Info.plist`
3. Adds font file references to the pbxproj (`PBXFileReference` + `PBXBuildFile` sections)
4. Creates a `PBXResourcesBuildPhase` for the widget target and adds the fonts to it

## Step-by-Step

### 1. Create the config plugin

Create `plugins/with-widget-fonts.ts`:

```typescript
import {
  type ConfigPlugin,
  withDangerousMod,
  withXcodeProject,
} from "expo/config-plugins";
import fs from "fs";
import path from "path";

const WIDGET_TARGET_NAME = "ExpoWidgetsTarget";

type Options = {
  fonts: string[];
};

const withWidgetFonts: ConfigPlugin<Options> = (config, { fonts }) => {
  config = withFontFiles(config, { fonts });
  config = withXcodeResources(config, { fonts });
  return config;
};

function withFontFiles(
  config: Parameters<ConfigPlugin<Options>>[0],
  { fonts }: Options,
) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const widgetDir = path.join(platformRoot, WIDGET_TARGET_NAME);

      fs.mkdirSync(widgetDir, { recursive: true });

      for (const fontPath of fonts) {
        const resolvedFontPath = path.resolve(projectRoot, fontPath);
        const fileName = path.basename(fontPath);
        const destPath = path.join(widgetDir, fileName);

        if (!fs.existsSync(resolvedFontPath)) {
          console.warn(`[with-widget-fonts] Font not found: ${resolvedFontPath}`);
          continue;
        }

        fs.copyFileSync(resolvedFontPath, destPath);
      }

      const infoPlistPath = path.join(widgetDir, "Info.plist");
      if (fs.existsSync(infoPlistPath)) {
        let content = fs.readFileSync(infoPlistPath, "utf-8");
        if (!content.includes("UIAppFonts")) {
          const fontFileNames = fonts.map((f) => path.basename(f));
          const fontsXml = fontFileNames
            .map((name) => `\t\t<string>${name}</string>`)
            .join("\n");
          const uiAppFontsBlock = `\t<key>UIAppFonts</key>\n\t<array>\n${fontsXml}\n\t</array>\n`;
          content = content.replace(
            /(<\/dict>)(?![\s\S]*<\/dict>)/,
            `${uiAppFontsBlock}$1`,
          );
          fs.writeFileSync(infoPlistPath, content);
        }
      }

      return config;
    },
  ]);
}

function withXcodeResources(
  config: Parameters<ConfigPlugin<Options>>[0],
  { fonts }: Options,
) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const platformRoot = config.modRequest.platformProjectRoot;
    const widgetDir = path.join(platformRoot, WIDGET_TARGET_NAME);

    const widgetTargetUuid = findTargetByName(project, WIDGET_TARGET_NAME);
    if (!widgetTargetUuid) {
      console.warn(
        `[with-widget-fonts] Target "${WIDGET_TARGET_NAME}" not found`,
      );
      return config;
    }

    const resourcesPhaseUuid = ensureResourcesBuildPhase(
      project,
      widgetTargetUuid,
    );
    const widgetGroupKey = findGroupByName(project, WIDGET_TARGET_NAME);

    for (const fontPath of fonts) {
      const fileName = path.basename(fontPath);

      const fileRefUuid = project.generateUuid();
      const buildFileUuid = project.generateUuid();

      const file = {
        uuid: buildFileUuid,
        fileRef: fileRefUuid,
        basename: fileName,
        path: fileName,
        sourceTree: '"<group>"',
        lastKnownFileType: "font",
        group: "Resources",
      };

      project.addToPbxFileReferenceSection(file);
      project.addToPbxBuildFileSection(file);

      if (widgetGroupKey) {
        project.addToPbxGroup(file, widgetGroupKey);
      }

      const resourcesPhase =
        project.hash.project.objects.PBXResourcesBuildPhase[resourcesPhaseUuid];
      resourcesPhase.files.push({
        value: buildFileUuid,
        comment: `${fileName} in Resources`,
      });
    }

    return config;
  });
}

function findTargetByName(project: any, name: string): string | null {
  const targets = project.hash.project.objects.PBXNativeTarget ?? {};
  for (const [uuid, target] of Object.entries(targets)) {
    if (typeof target !== "object" || target === null) continue;
    if ((target as { name?: string }).name === name) {
      return uuid;
    }
  }
  return null;
}

function findGroupByName(project: any, name: string): string | null {
  const groups = project.hash.project.objects.PBXGroup ?? {};
  for (const [key, group] of Object.entries(groups)) {
    if (typeof group !== "object" || group === null) continue;
    if ((group as { name?: string }).name === name) {
      return key;
    }
  }
  return null;
}

function ensureResourcesBuildPhase(
  project: any,
  targetUuid: string,
): string {
  const target = project.pbxNativeTargetSection()[targetUuid];
  if (target?.buildPhases) {
    for (const bp of target.buildPhases) {
      if (bp.comment === "Resources") {
        return bp.value;
      }
    }
  }

  const phaseUuid = project.generateUuid();
  const commentKey = `${phaseUuid}_comment`;

  if (!project.hash.project.objects.PBXResourcesBuildPhase) {
    project.hash.project.objects.PBXResourcesBuildPhase = {};
  }

  project.hash.project.objects.PBXResourcesBuildPhase[phaseUuid] = {
    isa: "PBXResourcesBuildPhase",
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  project.hash.project.objects.PBXResourcesBuildPhase[commentKey] = "Resources";

  if (target?.buildPhases) {
    target.buildPhases.push({
      value: phaseUuid,
      comment: "Resources",
    });
  }

  return phaseUuid;
}

export default withWidgetFonts;
```

### 2. Register the plugin BEFORE expo-widgets

In `app.config.ts`, the plugin **must** be listed **before** `expo-widgets`:

```typescript
plugins: [
  "expo-asset",
  "expo-router",
  [
    "./plugins/with-widget-fonts",
    {
      fonts: [
        "node_modules/@expo-google-fonts/yellowtail/400Regular/Yellowtail_400Regular.ttf",
        "node_modules/@expo-google-fonts/young-serif/400Regular/YoungSerif_400Regular.ttf",
      ],
    },
  ],
  [
    "expo-widgets",
    { /* widget config */ },
  ],
  // ... other plugins
],
```

**Why before?** Expo config plugin mods evaluate outermost-first (LIFO). Plugins listed earlier are wrapped around plugins listed later. By placing `with-widget-fonts` before `expo-widgets`, its `withXcodeProject` mod runs **after** `expo-widgets` has created the widget target — so it can find and modify it.

### 3. Use the font in widget components

In your widget components, use the `font` modifier with the `family` parameter set to the font's **PostScript name** (not the filename):

```tsx
import { font } from "@expo/ui/swift-ui/modifiers";

<Text modifiers={[
  font({ family: "Yellowtail-Regular", size: 16 }),
]}>
  {verse}
</Text>
```

### 4. Find the correct PostScript name

The `family` value must match the font's **PostScript name** (nameID 6 in the TTF name table), not the filename. For `@expo-google-fonts` packages:

| Font file | PostScript name |
|---|---|
| `Yellowtail_400Regular.ttf` | `Yellowtail-Regular` |
| `YoungSerif_400Regular.ttf` | `YoungSerif-Regular` |

To find the PostScript name for any font, parse the TTF name table:

```bash
python3 -c "
from fontTools.ttLib import TTFont
font = TTFont('path/to/font.ttf')
print(font['name'].getDebugName(6))
"
```

Or if fonttools isn't available, use `fc-query` (Linux) or check the font in Font Book (macOS).

### 5. Prebuild and run

```bash
pnpm prebuild:dev   # or your equivalent prebuild command
pnpm ios
```

## Gotchas

### Plugin ordering is critical
If `with-widget-fonts` is placed **after** `expo-widgets` in the plugins array, it runs **before** the widget target exists and silently does nothing (the target lookup fails). Always place it **before** `expo-widgets`.

### Don't use `addResourceFile()` from the `xcode` package
The `xcode` npm package's `addResourceFile()` method internally calls `pbxGroupByName('Resources')`, which returns `null` for the widget extension (it has no "Resources" group in the standard sense). This causes a `TypeError: Cannot read properties of null (reading 'path')`. Instead, use the lower-level methods: `addToPbxFileReferenceSection`, `addToPbxBuildFileSection`, and `addToPbxGroup`.

### File path must be relative to the widget group, not platform root
When adding the `PBXFileReference`, set `path` to just the filename (e.g., `"Yellowtail_400Regular.ttf"`), not the full path from `ios/`. The widget group already has its own path context. Using the full path causes Xcode to look for `ExpoWidgetsTarget/ExpoWidgetsTarget/Yellowtail_400Regular.ttf` (double-nested) and fail with "no such file".

### expo-widgets doesn't create a PBXResourcesBuildPhase
The `expo-widgets` plugin creates Sources, Copy Files, and Frameworks build phases for the widget target, but **not** a Resources build phase. You must create one manually before adding resource files to it.

### UIAppFonts goes in the widget's Info.plist, not the main app's
The widget extension has its own `Info.plist` at `ios/ExpoWidgetsTarget/Info.plist` (generated by `expo-widgets`). The `UIAppFonts` key must be added there, not in the main app's Info.plist.

## Reference

- Working plugin: `plugins/with-widget-fonts.ts`
- Working config: `app.config.ts` (plugin registered before `expo-widgets`)
- Widget components using custom fonts: `components/widgets/letter-verse-widget.tsx`, `postcard-widget.tsx`, `square-letter-widget.tsx`
