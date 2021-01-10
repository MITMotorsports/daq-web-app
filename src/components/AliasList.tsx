import React, { useState } from "react";
import { promisify } from 'util';

import { KeyValue } from 'react-key-value';
interface Alias {
  field: string;
  alias: string;
}

const getAliases = async () => { await promisify(setTimeout)(1000); return [] };
const AliasList: React.FC = () => {
  const [aliasList, setAliasList] = useState<Alias[]>([]);
  getAliases().then(res => { setAliasList(res) });
  return (
    <KeyValue rows={aliasList} onChange = {(newList: Alias[]) => setAliasList(newList)}></KeyValue>
  );
};

export default AliasList;
