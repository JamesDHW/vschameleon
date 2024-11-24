import { window, workspace, ExtensionContext } from "vscode";
import {
  ConfigType,
  getConfigForFilePath,
  loadConfiguration,
  watchConfigurationFile,
} from "./utils/config";
import {
  getCurrentTheme,
  logInfo,
  resetVsCodeColorConfig,
  resetVsCodeThemeConfig,
  setVsCodeColorConfig,
  setVsCodeThemeConfig,
} from "./utils/vsCode";

let VSCHAMELEON_CONFIG: ConfigType | null = null;
let DEFAULT_COLOR_THEME = getCurrentTheme();

export async function activate(_: ExtensionContext) {
  logInfo("VSChameleon extension activated!");

  VSCHAMELEON_CONFIG = await loadConfiguration();
  if (!VSCHAMELEON_CONFIG) {
    return;
  }

  watchConfigurationFile((newConfig) => (VSCHAMELEON_CONFIG = newConfig));

  await setWindowColorForActiveWindow();

  window.onDidChangeActiveTextEditor(async (editor) => {
    if (!editor) {
      return;
    }

    await setWindowColor(editor?.document.fileName, VSCHAMELEON_CONFIG);
  });

  workspace.onDidChangeConfiguration(async (event) => {
    const config = await getConfigForActiveWindow();
    if (event.affectsConfiguration("workbench.colorTheme") && !config?.theme) {
      logInfo(`Setting default theme to ${getCurrentTheme()}`);
      DEFAULT_COLOR_THEME = getCurrentTheme();
    }
  });
}

const setWindowColor = async (
  filePath: string | undefined,
  config: ConfigType | null
) => {
  if (!filePath || !config) {
    return;
  }

  const filePathConfig = getConfigForFilePath(
    workspace.asRelativePath(filePath),
    config
  );

  if (!filePathConfig?.colors) {
    logInfo(`Resetting colors`);
    await resetVsCodeColorConfig();
  }

  if (!filePathConfig?.theme && getCurrentTheme() !== DEFAULT_COLOR_THEME) {
    logInfo(`Resetting theme to ${DEFAULT_COLOR_THEME}`);
    await resetVsCodeThemeConfig(DEFAULT_COLOR_THEME);
  }

  if (filePathConfig?.theme) {
    await setVsCodeThemeConfig(filePathConfig.theme);
  }

  if (filePathConfig?.colors) {
    await setVsCodeColorConfig(filePathConfig.colors);
  }
};

const setWindowColorForActiveWindow = async () => {
  const activeEditor = window.activeTextEditor;
  if (activeEditor) {
    await setWindowColor(
      workspace.asRelativePath(activeEditor.document.fileName),
      VSCHAMELEON_CONFIG
    );
  }
};

const getConfigForActiveWindow = async () => {
  const activeEditor = window.activeTextEditor;
  if (activeEditor) {
    return await getConfigForFilePath(
      workspace.asRelativePath(activeEditor.document.fileName),
      VSCHAMELEON_CONFIG
    );
  }

  return null;
};
