import { window, workspace, ConfigurationTarget } from "vscode";

export const showErrorMessage = (message: string) =>
  window.showErrorMessage(message);

export const logInfo = (message: string) =>
  console.log(`[VSChameleon] ${new Date().toLocaleString()}: ${message}`);

export const setVsCodeColorConfig = async (
  colors: Record<string, string> | null
): Promise<void> => {
  await saveSettingsFile();

  const vsCodeConfig = workspace.getConfiguration("workbench");
  await vsCodeConfig.update(
    "colorCustomizations",
    colors,
    ConfigurationTarget.Workspace
  );
  await saveSettingsFile();
};
export const resetVsCodeColorConfig = async () =>
  await setVsCodeColorConfig(null);

export const setVsCodeThemeConfig = async (
  themeName: string | null
): Promise<void> => {
  await saveSettingsFile();

  const vsCodeConfig = workspace.getConfiguration("workbench");
  await vsCodeConfig.update(
    "colorTheme",
    themeName,
    ConfigurationTarget.Workspace
  );
  await saveSettingsFile();
};
export const resetVsCodeThemeConfig = async (defaultTheme: string) =>
  await setVsCodeThemeConfig(defaultTheme);

export const getCurrentTheme = (): string => {
  const config = workspace.getConfiguration("workbench");
  return config.get("colorTheme", "Dark (Visual Studio)");
};

const saveSettingsFile = async () => {
  const settingsDoc = workspace.textDocuments.find(
    (doc) => doc.fileName.endsWith("settings.json") && doc.isDirty
  );

  if (settingsDoc) {
    await settingsDoc.save();
  }
};
