import React, { useEffect, useState } from 'react';
import TableCrud from './TableCrud';

export default function ParametresPage() {
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
   fetch("http://localhost/app-web/backend/api/list_tables.php")
      .then(r => r.json())
      .then(data => setTables(data.tables || []))
      .catch(console.error);
  }, []);

  return (
    <div className="container my-4">
      <h3>Paramètres - Tables</h3>
      <div className="mb-3">
        {tables.map(t => (
          <button key={t} onClick={() => setSelected(t)}
            className={"btn btn-sm me-2 mb-2 " + (selected===t ? 'btn-primary' : 'btn-outline-secondary')}>
            {t}
          </button>
        ))}
      </div>

      {selected ? (
        <div>
          <h5>Table : {selected}</h5>
          <TableCrud table={selected} />
        </div>
      ) : (
        <p>Sélectionne une table pour gérer son contenu.</p>
      )}
    </div>
  );
}
