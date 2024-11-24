import { workspace } from "vscode";
import * as fs from "fs";
import * as path from "path";
import { logInfo, showErrorMessage } from "./vsCode";

const CONFIG_FILENAME = ".vschameleon.config.json";
export type ConfigType = {
  workspaces: {
    [name: string]: {
      match: string;
      colors: Record<string, string>;
      theme: string;
    };
  };
};

const getConfigFilePath = () => {
  const workspaceFolders = workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  return path.join(workspaceRoot, CONFIG_FILENAME);
};

export const loadConfiguration = async (): Promise<ConfigType | null> => {
  const configFilePath = getConfigFilePath();

  if (!configFilePath || !fs.existsSync(configFilePath)) {
    return null;
  }

  try {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    showErrorMessage(
      `Failed to parse '${CONFIG_FILENAME}'. Please check the file format.`
    );
    return null;
  }
};

export const watchConfigurationFile = async (
  setNewConfig: (newConfig: ConfigType | null) => void
) => {
  const configFilePath = getConfigFilePath();

  if (!configFilePath) {
    return null;
  }

  fs.watchFile(configFilePath, async (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      const newConfig = await loadConfiguration();
      setNewConfig(newConfig);
      logInfo(`${CONFIG_FILENAME} configuration file updated.`);
    }
  });
};

export const getConfigForFilePath = (
  filePath: string,
  config: ConfigType | null
) => {
  if (!config || !config.workspaces) {
    return null;
  }

  for (const [key, workspace] of Object.entries(config.workspaces)) {
    const match = workspace.match;

    try {
      const regex = new RegExp(match);
      if (regex.test(filePath)) {
        return { colors: workspace.colors, theme: workspace.theme };
      }
    } catch (error) {
      showErrorMessage(
        `Invalid regex pattern for workspace "${key}": ${match}`
      );
    }
  }

  return null;
};
