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
  deleted: boolean | undefined;
  metadata: FileMetadata;
  cache?: Map<string, string>;
  parse_status?: string | number;
  npzURL?: string;
}

export type MetadataField =
  | "chassis"
  | "location"
  | "activity"
  | "testNum"
  | "notes";

export interface FileMetadata {
  chassis?: string;
  location?: string;
  activity?: string;
  testNum?: string;
  notes?: string;
}

export const getFiles = async (
  setter: (value: (prev: LogFile[]) => LogFile[]) => void
) => {
  const querySnapshot = await firebase.firestore().collection("files").get();
  const files = [] as LogFile[];
  await Promise.all(
    querySnapshot.docs.map(async (docSnapshot) => {
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

      // Show all results immediately
      const docData = docSnapshot.data();
      if (!docData.deleted) {
        const npzURL = await getDownloadUrlForFile(
          docSnapshot.id,
          "parsed.npz"
        );
        files.push({
          id: docSnapshot.id,
          name: docData.name,
          columns: columns,
          uploadDate: (docData!
            .uploaded as firebase.firestore.Timestamp).toDate(),
          metadata: docData.metadata,
          deleted: docData.deleted,
          cache: docData.cache
            ? new Map(Object.entries(docData.cache))
            : docData.cache,
          parse_status: docData.parse_status,
          npzURL: npzURL,
        });

        // Add listener to currently parsing files
        if (
          docData.parse_status === "started" ||
          docData.parse_status === "uploaded" ||
          typeof docData.parse_status === "number"
        )
          firebase
            .firestore()
            .collection("files")
            .doc(docSnapshot.id)
            .onSnapshot(async (doc) => {
              const docData = doc.data();
              if (!docData) return;
              const newFile = {
                id: doc.id,
                name: docData.name,
                columns: columns,
                uploadDate: (docData!
                  .uploaded as firebase.firestore.Timestamp).toDate(),
                metadata: docData.metadata,
                deleted: docData.deleted,
                cache: docData.cache
                  ? new Map(Object.entries(docData.cache))
                  : docData.cache,
                parse_status: docData.parse_status,
                npzURL:
                  docData.parse_status === "done"
                    ? await getDownloadUrlForFile(docSnapshot.id, "parsed.npz")
                    : undefined,
              };
              setter((oldfiles: LogFile[]) => {
                const idx = oldfiles.findIndex((e) => e.id === newFile.id);
                let copy = [...oldfiles];
                if (idx === -1) {
                  copy.push(newFile);
                } else {
                  copy[idx] = newFile;
                }
                return copy;
              });
            });
      }
    })
  );
  setter(() => files);
};

export interface FilePreviewData {
  gps_coords: L.LatLng[] | null;
  fields_data: Map<string, [number[], number[]]> | null;
  info: [string, string][] | null;
}

export const getPreviewData = async (file: LogFile) => {
  let resp;
  if (file?.cache?.has("preview")) {
    resp = await axios.get(
      await getDownloadUrlForPath(
        getPathForCachedFile(file.id, file.cache.get("preview")!)
      )
    );
  } else {
    resp = await axios.post(
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
  }
  const json_obj = resp.data;
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
  firebase
    .storage()
    .ref(`prototype/${fileId}/${name}`)
    .getDownloadURL()
    .catch((e) => null);

export const getPathForCachedFile = (fileId: string, csvFileName: string) =>
  `prototype/${fileId}/${csvFileName}`;

export const getDownloadUrlForPath = async (path: string): Promise<string> =>
  firebase.storage().ref(path).getDownloadURL();

export const setFileMetadata = (
  file: LogFile,
  metadata: FileMetadata
): Promise<void> =>
  firebase
    .firestore()
    .collection("files")
    .doc(file.id)
    .update({ metadata: metadata });

export const deleteFile = async (fileId: string) =>
  firebase
    .firestore()
    .collection("files")
    .doc(fileId)
    .update({ deleted: true });
