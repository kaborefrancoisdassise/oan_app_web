import React, { useEffect, useState } from 'react';
import TableCrud from './TableCrud';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Setting.css'; // fichier CSS pour l’effet zoom

export default function ParametresPage() {
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://localhost/app-web/backend/api/list_tables.php")
      .then(r => r.json())
      .then(data => setTables(data.tables || []))
      .catch(console.error);
  }, []);

  const openModal = (tableName) => {
    setSelected(tableName);
    const modal = new window.bootstrap.Modal(document.getElementById('tableCrudModal'));
    modal.show();
  };

  return (<div className="container my-4">
  <div className="card shadow-lg border-0" style={{ maxWidth: '400px', margin: '0 auto' }}>
    <div className="card-header bg-primary text-white">
      <h4 className="mb-0">Paramètre</h4>
    </div>
    <div className="card-body p-0">
      <ul className="list-group list-group-flush">
        {tables.map((t) => (
          <li
            key={t}
            className="list-group-item list-hover-effect"
            onClick={() => openModal(t)}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* Modal Bootstrap */}
  <div
    className="modal fade"
    id="tableCrudModal"
    tabIndex="-1"
    aria-labelledby="tableCrudModalLabel"
    aria-hidden="true"
  >
    <div className="modal-dialog modal-xl modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title" id="tableCrudModalLabel">
            Gestion de : {selected}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body">
          {selected && <TableCrud table={selected} />}
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
