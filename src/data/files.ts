import firebase from "firebase/app";
import "firebase/firestore";
import L from "leaflet";
import axios from "axios";

const dataTypes: {
  [key: string]: {
    message: string;
    field: string;
    scaling_factor: number;
    unit: string;
    alias: string;
  };
} = require("../data_types.json");

export type ColumnInfo = {
  message: string;
  field: string;
  alias: string;
  unit: string;
  scale_factor: number;
};
export interface LogFile {
  id: string;
  name: string;
  columns: ColumnInfo[];
  uploadDate: Date;
}

export const getFiles = async () => {
  const querySnapshot = await firebase.firestore().collection("files").get();
  const files = [] as LogFile[];
  querySnapshot.docs.forEach((docSnapshot) => {
    const messageNames: string[] = docSnapshot.data().columns ?? [];
    const columns: ColumnInfo[] = [];
    for (const messageName of messageNames) {
      for (const [, value] of Object.entries(dataTypes)) {
        if (value.message === messageName) {
          columns.push({
            message: value.message,
            field: value.field,
            alias: value.alias,
            unit: value.unit,
            scale_factor: value.scaling_factor,
          });
        }
      }
    }
    columns.sort((a, b) =>
      a.message.concat(a.field) > b.message.concat(b.field) ? 1 : -1
    );
    files.push({
      id: docSnapshot.id,
      name: docSnapshot.data().name,
      columns: columns,
      uploadDate: (docSnapshot.data()!
        .uploaded as firebase.firestore.Timestamp).toDate(),
    });
  });
  return files;
};

export interface FilePreviewData {
  gps_coords: L.LatLng[] | null;
  fields_data: Map<string, [number[], number[]]> | null;
  info: [string, string][] | null;
}

export const getPreviewData = async (file: LogFile) => {
  const resp = await axios.post(
    "https://us-central1-mitmotorsportsdata.cloudfunctions.net/get_preview_data",
    {
      file_id: file!.id,
    },
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const json_obj = resp.data;
  console.log(json_obj);
  const preview_obj: FilePreviewData = {} as FilePreviewData;
  if ("gps_coords" in json_obj) {
    preview_obj["gps_coords"] = (json_obj["gps_coords"] as [
      number,
      number
    ][]).map((pos) => new L.LatLng(pos[0], pos[1]));
  }

  if ("fields_data" in json_obj) {
    preview_obj.fields_data = new Map();
    for (let field in json_obj["fields_data"]) {
      preview_obj.fields_data.set(field, [
        json_obj["fields_data"][field]["x"],
        json_obj["fields_data"][field]["y"],
      ]);
    }
  }
  if ("info" in json_obj) {
    preview_obj.info = [];
    for (let key in json_obj["info"]) {
      preview_obj.info.push([key, json_obj["info"][key]]);
    }
  }

  return preview_obj;
};

export const getDownloadUrlForFile = async (
  fileId: string,
  name: string
): Promise<string> =>
  firebase.storage().ref(`prototype/${fileId}/${name}`).getDownloadURL();

export const getDownloadUrlForPath = async (path: string): Promise<string> =>
  firebase.storage().ref(path).getDownloadURL();
