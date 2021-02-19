import React, { useState } from "react";
import Fuse from "fuse.js";
import { LogFile, getFiles } from "../data/files";
import fullWhite from "../images/fullWhite.png";

import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
  makeStyles,
  Grid,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";

import SearchBar from "material-ui-search-bar";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { DateRangePicker, DateRange } from "materialui-daterange-picker";

import FileModal from "./FileModal";
import UploadModal from "./UploadModal";
import FileListItem from "../components/FileListItem";
import { Container, AppBar, Toolbar } from "@material-ui/core";

type FileFilter = (l: LogFile) => boolean;
const Home: React.FC = () => {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<LogFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileTypeSelection, setFileTypeSelection] = useState<"logs" | "specs">(
    "logs"
  );
  const [opened, setOpened] = useState<boolean[]>([]);

  const [dateOpened, setDateOpened] = useState<boolean>(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({});
  const myYearOptions = ["MY18", "MY19", "MY20", "MY21"];
  const [myYears, setmyYears] = useState<string[]>(myYearOptions);
  const [searchText, setSearchText] = useState<string>();

  const searchOptions = {
    keys: ["name"],
  };

  const fuse = new Fuse(logFiles, searchOptions);

  const [filters] = useState<Map<string, FileFilter>>(
    new Map<string, FileFilter>([["deleted", (l: LogFile) => !l.deleted]])
  );
  const setFilters = async (name: string, f: FileFilter) => {
    if (filters) filters.set(name, f);
    reloadFiles();
  };

  const reloadFiles = async () => {
    const fls = await getFiles();
    setLogFiles(fls);

    const newOpenedState = new Array(fls.length).fill(false);
    // Preserve state of previous groups
    if (opened) {
      for (let i = 0; i < Math.min(opened.length, newOpenedState.length); i++) {
        newOpenedState[i] = opened[i];
      }
    }
    setOpened(newOpenedState);
  };

  window.addEventListener("load", reloadFiles);

  makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
  }))();

  return (
    <Container
      style={{ height: "100%", overflow: "scroll" }}
      maxWidth={false}
      disableGutters={true}
    >
      <AppBar position="sticky">
        <Toolbar>
          <Grid
            justify="space-between"
            container
            spacing={1}
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Grid item>
              <a href="/home">
                <img
                  src={fullWhite}
                  alt="MIT Motorsports"
                  style={{ height: "4.7vh" }}
                ></img>
              </a>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => setShowUploadModal(true)}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Container>
        <Tabs
          onChange={(e, val) => setFileTypeSelection(val)}
          value={fileTypeSelection}
        >
          <Tab label="Logs" value="logs" tabIndex={0}></Tab>
          <Tab label="CAN Specs" value="specs" tabIndex={1}></Tab>
        </Tabs>

        <List>
          <ListItem>
            <TextField
              label="Start date"
              value={dateRange.startDate?.toDateString()}
              InputProps={{ readOnly: true }}
              defaultValue=" "
            ></TextField>
            <TextField
              label="End date"
              value={dateRange.endDate?.toDateString()}
              InputProps={{ readOnly: true }}
              defaultValue=" "
            ></TextField>

            <Button onClick={() => setDateOpened(true)}>Select Range</Button>
            <DateRangePicker
              closeOnClickOutside={true}
              open={dateOpened}
              toggle={() => setDateOpened(!dateOpened)}
              onChange={(range) => {
                setDateRange(range);
                console.log(range.startDate);
                setFilters(
                  "startDate",
                  (f) => !range.startDate || range.startDate <= f.uploadDate
                );
                setFilters(
                  "endDate",
                  (f) => !range.endDate || range.endDate >= f.uploadDate
                );
                setDateOpened(false);
              }}
            />
          </ListItem>

          <ListItem>
            <FormControl>
              <InputLabel>Chassis</InputLabel>
              <Select
                multiple
                value={myYears}
                onChange={(e) => setmyYears(e.target.value as string[])}
                renderValue={(selected) => (selected as string[]).join(", ")}
              >
                {myYearOptions.map((x, i) => (
                  <MenuItem key={x} value={x}>
                    <Checkbox checked={myYears.indexOf(x) > -1} />
                    <ListItemText primary={x}></ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>

          <ListItem>
            <SearchBar
              value={searchText}
              onChange={(e) => {
                setSearchText(e);

                fuse.setCollection(logFiles);
                const searchMatches =
                  e === "" ? logFiles : fuse.search(e).map((f) => f.item);

                setFilters(
                  "searchText",
                  (f) => searchMatches.find((e) => e.id === f.id) !== undefined
                );
              }}
            />
          </ListItem>
        </List>

        <List style={{ maxHeight: "100%", overflow: "auto" }}>
          {(() => {
            // Group logs by date
            const groups = logFiles.reduce((groups, log) => {
              const dateString = log.uploadDate.toDateString();
              if (!groups.has(dateString)) {
                groups.set(dateString, []);
              }
              groups.get(dateString).push(log);
              return groups;
            }, new Map());
            // Create components for each file that matches all filters then sort the groups by date
            const groupItems = Array.from(groups, ([k, v]) => [
              Date.parse(k),
              v
                .map((f: LogFile) =>
                  !filters ||
                  Array.from(filters.values()).every((filter) => filter(f)) ? (
                    <FileListItem
                      key={f.id}
                      file={f}
                      onClick={() => setSelectedFile(f)}
                      reloadFiles={reloadFiles}
                    />
                  ) : null
                )
                .filter((el: React.FC) => el !== null),
            ])
              .sort((a, b) => (a[0] > b[0] ? -1 : 1))
              .map(([k, v]) => [new Date(k).toDateString(), v]);

            return groupItems.map((item, i) =>
              item[1].length > 0 ? (
                !searchText ? (
                  <Container>
                    <ListItem
                      button
                      onClick={() => {
                        setOpened(opened.map((e, idx) => (i === idx ? !e : e)));
                      }}
                    >
                      <ListItemText
                        primary={item[0]}
                        secondary={item[1].length.toString() + " files"}
                      />
                      {opened[i] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={opened[i]}>
                      <Container>
                        <List>{item[1]}</List>
                      </Container>
                    </Collapse>
                  </Container>
                ) : (
                  <Container>
                    <List>{item[1]}</List>
                  </Container>
                )
              ) : null
            );
          })()}
        </List>
      </Container>
      <Dialog
        open={showUploadModal}
        onExited={() => {
          setShowUploadModal(false);
          reloadFiles();
        }}
        maxWidth="lg"
      >
        <DialogTitle>Upload</DialogTitle>
        <DialogContent>
          <UploadModal />
          <Button onClick={() => setShowUploadModal(false)}>Done</Button>
        </DialogContent>
      </Dialog>

      <FileModal
        file={selectedFile}
        onExited={() => {
          setSelectedFile(null);
          reloadFiles();
        }}
      />
    </Container>
  );
};

export default Home;
