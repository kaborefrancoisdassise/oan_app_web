
import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Composant Sites complet
 * - Barre scrollable : Régions / Provinces / Communes / Villages
 * - Modal pour afficher les noms (chaque nom est cliquable)
 * - Modal pour afficher les sites d'un niveau avec recherche
 * - Modal pour afficher les détails d'un site
 * - Formulaire d'ajout de site + import Excel
 * - Filtrage technologie corrigé depuis les données locales
 */

const Sites = () => {
  // --- États existants ---
  const [localites, setLocalites] = useState([]);
  const [operateurs, setOperateurs] = useState([]);
  const [typeSites, setTypeSites] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [sites, setSites] = useState([]);
  const [allSites, setAllSites] = useState([]); // Tous les sites pour le filtrage
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState(null);
  
  // États pour les filtres dropdown
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showTechFilter, setShowTechFilter] = useState(false);

  // États hiérarchiques
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);

  // États pour les filtres actifs
  const [activeLocationFilter, setActiveLocationFilter] = useState({
    type: "",
    value: ""
  });
  const [activeTechFilter, setActiveTechFilter] = useState({
    type: "",
    operateur: "",
    technologie: ""
  });

  const [importData, setImportData] = useState({
    id_operateur: "",
    id_type_site: "",
    annee_site: "",
    id_trimestre: ""
  });

  const [formData, setFormData] = useState({
    nom_site: "",
    latitude_site: "",
    longitude_site: "",
    id_localite: "",
    id_operateur: "",
    id_type_site: "",
    annee_site: "",
    id_trimestre: ""
  });

  // --- Modals ---
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelModalTitle, setLevelModalTitle] = useState("");
  const [levelModalItems, setLevelModalItems] = useState([]);

  const [showSitesModal, setShowSitesModal] = useState(false);
  const [sitesModalTitle, setSitesModalTitle] = useState("");
  const [sitesModalItems, setSitesModalItems] = useState([]);

  // NOUVEAU: État pour la recherche dans le modal sites
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [filteredModalSites, setFilteredModalSites] = useState([]);

  const [showSiteDetailsModal, setShowSiteDetailsModal] = useState(false);
  const [siteDetails, setSiteDetails] = useState(null);

  // --- Chargement initial ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          resLocalites,
          resOperateurs,
          resTypeSites,
          resTrimestres,
          resSites,
          resRegions,
          resProvinces,
          resCommunes,
          resVillages
        ] = await Promise.all([
          axios.get("http://localhost/app-web/backend/api/getLocalites.php"),
          axios.get("http://localhost/app-web/backend/api/getOperateurs.php"),
          axios.get("http://localhost/app-web/backend/api/getTypeSites.php"),
          axios.get("http://localhost/app-web/backend/api/getTrimestres.php"),
          axios.get("http://localhost/app-web/backend/api/getSites.php"),
          axios.get("http://localhost/app-web/backend/api/regions.php").catch(() => ({ data: [] })),
          axios.get("http://localhost/app-web/backend/api/Provinces.php").catch(() => ({ data: [] })),
          axios.get("http://localhost/app-web/backend/api/communes.php").catch(() => ({ data: [] })),
          axios.get("http://localhost/app-web/backend/api/villages.php").catch(() => ({ data: [] }))
        ]);

        setLocalites(resLocalites.data || []);
        setOperateurs(resOperateurs.data || []);
        setTypeSites(resTypeSites.data || []);
        setTrimestres(resTrimestres.data || []);
        setSites(resSites.data || []);
        setAllSites(resSites.data || []);
        setRegions(resRegions.data || []);
        setProvinces(resProvinces.data || []);
        setCommunes(resCommunes.data || []);
        setVillages(resVillages.data || []);
      } catch (error) {
        console.error("Erreur de chargement :", error);
        alert("❌ Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, []);

  // --- Effet pour filtrer les sites dans le modal selon la recherche ---
  useEffect(() => {
    if (!modalSearchTerm.trim()) {
      setFilteredModalSites(sitesModalItems);
    } else {
      const searchLower = modalSearchTerm.toLowerCase();
      const filtered = sitesModalItems.filter(site =>
        site.nom_site?.toLowerCase().includes(searchLower) ||
        site.nom_localite?.toLowerCase().includes(searchLower) ||
        site.nom_operateur?.toLowerCase().includes(searchLower) ||
        site.libelle_type?.toLowerCase().includes(searchLower) ||
        site.nom_type_site?.toLowerCase().includes(searchLower)
      );
      setFilteredModalSites(filtered);
    }
  }, [modalSearchTerm, sitesModalItems]);

  // --- Fonctions hiérarchiques ---
  const loadProvinces = async (regionId) => {
    try {
      const response = await axios.get(
        `http://localhost/app-web/backend/api/Provinces.php?id_region=${regionId}`
      );
      return response.data || [];
    } catch (error) {
      console.error("Erreur chargement provinces:", error);
      return [];
    }
  };

  const loadCommunes = async (provinceId) => {
    try {
      const response = await axios.get(
        `http://localhost/app-web/backend/api/communes.php?id_province=${provinceId}`
      );
      return response.data || [];
    } catch (error) {
      console.error("Erreur chargement communes:", error);
      return [];
    }
  };

  const loadVillages = async (communeId) => {
    try {
      const response = await axios.get(
        `http://localhost/app-web/backend/api/villages.php?id_commune=${communeId}`
      );
      return response.data || [];
    } catch (error) {
      console.error("Erreur chargement villages:", error);
      return [];
    }
  };

  // --- Filtrage par localisation (garde l'existant) ---
  const filterByLocation = async (type, value) => {
    try {
      if (!value) {
        setSites(allSites);
        setActiveLocationFilter({ type: "", value: "" });
        return;
      }
      const response = await axios.get(
        `http://localhost/app-web/backend/api/getSitesByLocation.php?type=${type}&value=${value}`
      );
      setSites(response.data || []);
      setActiveLocationFilter({ type, value });
      setActiveTechFilter({ type: "", operateur: "", technologie: "" });
    } catch (error) {
      console.error("Erreur filtrage localisation:", error);
      alert("❌ Erreur lors du filtrage par localisation");
    }
  };

  // --- FONCTION CORRIGÉE: Filtrage par technologie depuis les données locales ---
  const filterByTechnology = (type, operateur = "", technologie = "") => {
    try {
      let filteredSites = [];
      let title = "Sites";

      if (type === "operateur" && operateur) {
        // Filtrer par opérateur depuis allSites
        filteredSites = allSites.filter(site => 
          site.nom_operateur?.toLowerCase() === operateur.toLowerCase()
        );
        title = `Sites de ${operateur}`;
      } else if (type === "technologie" && technologie) {
        // Filtrer par technologie depuis allSites
        filteredSites = allSites.filter(site => 
          site.libelle_type?.toLowerCase() === technologie.toLowerCase() ||
          site.nom_type_site?.toLowerCase() === technologie.toLowerCase()
        );
        title = `Sites en ${technologie}`;
      }

      // Afficher dans le modal
      setSitesModalTitle(title);
      setSitesModalItems(filteredSites);
      setModalSearchTerm(""); // Reset la recherche
      setShowSitesModal(true);

      // Mettre à jour l'état des filtres
      setActiveTechFilter({ type, operateur, technologie });
      setActiveLocationFilter({ type: "", value: "" });

      // Fermer le menu technologie
      setShowTechFilter(false);

      console.log(`✅ Filtrage ${type}:`, operateur || technologie, `- ${filteredSites.length} sites trouvés`);

    } catch (error) {
      console.error("Erreur filtrage technologie:", error);
      alert("❌ Erreur lors du filtrage par technologie");
    }
  };

  const resetFilters = () => {
    setSites(allSites);
    setActiveLocationFilter({ type: "", value: "" });
    setActiveTechFilter({ type: "", operateur: "", technologie: "" });
    setShowLocationFilter(false);
    setShowTechFilter(false);
    setShowSitesModal(false);
  };

  // --- Ajout site ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = Object.keys(formData);
    const isEmpty = requiredFields.some((field) => !formData[field]);
    if (isEmpty) return alert("❌ Veuillez remplir tous les champs !");

    axios
      .post("http://localhost/app-web/backend/api/ajouter_site.php", formData)
      .then(() => {
        alert("✅ Site ajouté avec succès !");
        setFormData({
          nom_site: "",
          latitude_site: "",
          longitude_site: "",
          id_localite: "",
          id_operateur: "",
          id_type_site: "",
          annee_site: "",
          id_trimestre: ""
        });
        // Recharger les sites
        axios.get("http://localhost/app-web/backend/api/getSites.php").then((res) => {
          setSites(res.data || []);
          setAllSites(res.data || []);
        });
        setAfficherFormulaire(false);
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Erreur lors de l'enregistrement");
      });
  };

  // --- Importation ---
  const handleImportFile = (e) => setImportFile(e.target.files[0]);

  const handleImportChange = (e) => {
    const { name, value } = e.target;
    setImportData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importFile) return alert("❌ Veuillez sélectionner un fichier Excel.");

    const form = new FormData();
    form.append("file", importFile);
    form.append("id_operateur", importData.id_operateur);
    form.append("id_type_site", importData.id_type_site);
    form.append("annee_site", importData.annee_site);
    form.append("id_trimestre", importData.id_trimestre);

    axios
      .post("http://localhost/app-web/backend/api/importer_sites.php", form)
      .then(() => {
        alert("✅ Importation réussie");
        setShowImportForm(false);
        setImportFile(null);
        // Recharger les sites
        axios.get("http://localhost/app-web/backend/api/getSites.php").then((res) => {
          setSites(res.data || []);
          setAllSites(res.data || []);
        });
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Erreur lors de l'importation");
      });
  };

  // --- Modals & navigation ---
  const openLevelListModal = (level) => {
    switch (level) {
      case "regions":
        setLevelModalTitle("Toutes les régions");
        setLevelModalItems(
          (regions || []).map((r) => ({
            id: r.id_region,
            name: r.nom_region,
            raw: r
          }))
        );
        setShowLevelModal(true);
        break;
      case "provinces":
        setLevelModalTitle("Toutes les provinces");
        setLevelModalItems(
          (provinces || []).map((p) => ({
            id: p.id_province,
            name: p.nom_province,
            raw: p
          }))
        );
        setShowLevelModal(true);
        break;
      case "communes":
        setLevelModalTitle("Toutes les communes");
        setLevelModalItems(
          (communes || []).map((c) => ({
            id: c.id_commune,
            name: c.nom_commune,
            raw: c
          }))
        );
        setShowLevelModal(true);
        break;
      case "villages":
        setLevelModalTitle("Tous les villages");
        setLevelModalItems(
          (villages || []).map((v) => ({
            id: v.id_village,
            name: v.nom_village,
            raw: v
          }))
        );
        setShowLevelModal(true);
        break;
      default:
        break;
    }
  };

  const handleLevelItemClick_ShowSub = async (parentLevel, item) => {
    if (parentLevel === "region") {
      const provs = await loadProvinces(item.id);
      setLevelModalTitle(`Provinces de ${item.name}`);
      setLevelModalItems(
        (provs || []).map((p) => ({ id: p.id_province, name: p.nom_province, raw: p }))
      );
      setShowLevelModal(true);
    } else if (parentLevel === "province") {
      const comms = await loadCommunes(item.id);
      setLevelModalTitle(`Communes de ${item.name}`);
      setLevelModalItems(
        (comms || []).map((c) => ({ id: c.id_commune, name: c.nom_commune, raw: c }))
      );
      setShowLevelModal(true);
    } else if (parentLevel === "commune") {
      const vils = await loadVillages(item.id);
      setLevelModalTitle(`Villages de ${item.name}`);
      setLevelModalItems(
        (vils || []).map((v) => ({ id: v.id_village, name: v.nom_village, raw: v }))
      );
      setShowLevelModal(true);
    }
  };

  const handleLevelItemClick_ShowSites = async (type, item) => {
    try {
      const res = await axios.get(
        `http://localhost/app-web/backend/api/getSitesByLocation.php?type=${type}&value=${item.id}`
      );
      setSitesModalTitle(`Sites pour ${item.name}`);
      setSitesModalItems(res.data || []);
      setModalSearchTerm(""); // Reset la recherche
      setShowLevelModal(false);
      setShowSitesModal(true);
    } catch (error) {
      console.error("Erreur chargement sites par localisation:", error);
      alert("❌ Erreur chargement sites.");
    }
  };

  const openSiteDetails = (site) => {
    setSiteDetails(site);
    setShowSiteDetailsModal(true);
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header avec titre */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">📡 Gestion des Sites Télécom</h2>
            <div className="text-muted">
              <small>Total: {allSites.length} sites</small>
            </div>
          </div>
          <hr className="mt-2" />
        </div>
      </div>

      {/* Barre d'actions principale */}
      <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mb-4">
        {/* Filtre localisation */}
        <div className="dropdown">
          <button
            className="btn btn-primary btn-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            📍 Filtre localisation
          </button>
          <ul className="dropdown-menu p-2" style={{ minWidth: "200px" }}>
            <li>
              <button className="dropdown-item" onClick={() => openLevelListModal("regions")}>
                Régions
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => openLevelListModal("provinces")}>
                Provinces
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => openLevelListModal("communes")}>
                Communes
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => openLevelListModal("villages")}>
                Villages
              </button>
            </li>
          </ul>
        </div>

        {/* Filtre Technologie CORRIGÉ */}
        <div className="dropdown">
          <button
            className="btn btn-primary btn-sm dropdown-toggle"
            type="button"
            onClick={() => {
              setShowTechFilter(!showTechFilter);
              setShowLocationFilter(false);
            }}
          >
            📡 Filtre Technologie
          </button>

          {showTechFilter && (
            <div className="dropdown-menu show p-3" style={{ minWidth: "350px" }}>
              <h6 className="dropdown-header">🔍 Filtrer par technologie</h6>

              {/* Opérateurs */}
              <h6 className="mt-2 mb-2">👥 Opérateurs</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <button 
                  className="btn btn-outline-primary btn-sm" 
                  onClick={() => filterByTechnology("operateur", "Moov")}
                >
                  Moov ({allSites.filter(s => s.nom_operateur?.toLowerCase() === "moov").length})
                </button>
                <button 
                  className="btn btn-outline-warning btn-sm" 
                  onClick={() => filterByTechnology("operateur", "Orange")}
                >
                  Orange ({allSites.filter(s => s.nom_operateur?.toLowerCase() === "orange").length})
                </button>
                <button 
                  className="btn btn-outline-success btn-sm" 
                  onClick={() => filterByTechnology("operateur", "Telecel")}
                >
                  Telecel ({allSites.filter(s => s.nom_operateur?.toLowerCase() === "telecel").length})
                </button>
              </div>

              {/* Technologies */}
              <h6 className="mt-3 mb-2">📶 Technologies</h6>
              <div className="d-flex flex-wrap gap-2">
                <button 
                  className="btn btn-outline-dark btn-sm" 
                  onClick={() => filterByTechnology("technologie", "", "2G")}
                >
                  2G ({allSites.filter(s => s.libelle_type?.toLowerCase().includes("2g")).length})
                </button>
                <button 
                  className="btn btn-outline-dark btn-sm" 
                  onClick={() => filterByTechnology("technologie", "", "3G")}
                >
                  3G ({allSites.filter(s => s.libelle_type?.toLowerCase().includes("3g")).length})
                </button>
                <button 
                  className="btn btn-outline-dark btn-sm" 
                  onClick={() => filterByTechnology("technologie", "", "4G")}
                >
                  4G ({allSites.filter(s => s.libelle_type?.toLowerCase().includes("4g")).length})
                </button>
                <button 
                  className="btn btn-outline-dark btn-sm" 
                  onClick={() => filterByTechnology("technologie", "", "5G")}
                >
                  5G ({allSites.filter(s => s.libelle_type?.toLowerCase().includes("5g")).length})
                </button>
              </div>

              <div className="mt-3 pt-2 border-top">
                <button 
                  className="btn btn-outline-secondary btn-sm w-100" 
                  onClick={resetFilters}
                >
                  🔄 Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          className="btn btn-success btn-sm"
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
        >
          {afficherFormulaire ? "📋 Voir la liste" : "➕ Ajouter un site"}
        </button>

        <button
          className="btn btn-info btn-sm"
          onClick={() => setShowImportForm(!showImportForm)}
        >
          📥 Importer Excel
        </button>
      </div>

      {/* Indicateur de filtre actif */}
      {(activeLocationFilter.type || activeTechFilter.type) && (
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <span>
            {activeLocationFilter.type && <>🗺️ Filtre actif: {activeLocationFilter.type} </>}
            {activeTechFilter.type && (
              <>📡 Filtre actif: {activeTechFilter.operateur || activeTechFilter.technologie} </>
            )}
          </span>
          <small className="text-muted">{sites.length} site(s) affiché(s)</small>
        </div>
      )}

      {/* Formulaire d'importation */}
      {showImportForm && (
        <div className="card border-info mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">📥 Importer des sites via un fichier Excel</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleImportSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Opérateur</label>
                  <select name="id_operateur" className="form-select" onChange={handleImportChange} required>
                    <option value="">-- Choisir --</option>
                    {operateurs.map((op) => (
                      <option key={op.id_operateur} value={op.id_operateur}>
                        {op.nom_operateur}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Type de site</label>
                  <select name="id_type_site" className="form-select" onChange={handleImportChange} required>
                    <option value="">-- Choisir --</option>
                    {typeSites.map((type) => (
                      <option key={type.id_type_site} value={type.id_type_site}>
                        {type.libelle_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Année</label>
                  <input
                    type="text"
                    name="annee_site"
                    className="form-control"
                    onChange={handleImportChange}
                    required
                    pattern="\d{4}"
                    placeholder="Ex : 2024"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Trimestre</label>
                  <select name="id_trimestre" className="form-select" onChange={handleImportChange} required>
                    <option value="">-- Choisir --</option>
                    {trimestres.map((tri) => (
                      <option key={tri.id_trimestre} value={tri.id_trimestre}>
                        {tri.libelle_trimestre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Fichier Excel</label>
                  <input type="file" accept=".xlsx,.xls" className="form-control" onChange={handleImportFile} required />
                </div>
              </div>
              <button className="btn btn-info" type="submit">
                🚀 Importer maintenant
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {!afficherFormulaire ? (
        <div className="table-responsive">
          <h5 className="mb-3">📍 Liste des sites enregistrés</h5>
          <table className="table table-bordered table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Nom</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Localité</th>
                <th>Opérateur</th>
                <th>Type</th>
                <th>Année</th>
                <th>Trimestre</th>
              </tr>
            </thead>
            <tbody>
              {sites && sites.length > 0 ? (
                sites.map((site) => (
                  <tr key={site.id_site}>
                    <td>
                      <button className="btn btn-link p-0 text-start" onClick={() => openSiteDetails(site)}>
                        {site.nom_site}
                      </button>
                    </td>
                    <td>{site.latitude_site}</td>
                    <td>{site.longitude_site}</td>
                    <td>{site.nom_localite}</td>
                    <td>
                      <span className={`badge ${
                        site.nom_operateur?.toLowerCase() === 'orange' ? 'bg-warning' :
                        site.nom_operateur?.toLowerCase() === 'moov' ? 'bg-primary' :
                        site.nom_operateur?.toLowerCase() === 'telecel' ? 'bg-success' : 'bg-secondary'
                      }`}>
                        {site.nom_operateur}
                      </span>
                    </td>
                    <td>{site.libelle_type}</td>
                    <td>{site.annee_site}</td>
                    <td>{site.libelle_trimestre}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    Aucun site enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card shadow-lg border-0">
          <div className="card-header bg-success text-white">
            <h4 className="mb-0">📡 Ajouter un nouveau site</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nom du site</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="nom_site" 
                  value={formData.nom_site} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ex: Site Orange Ouaga 1"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="0.00000001"
                    className="form-control"
                    name="latitude_site"
                    value={formData.latitude_site}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 12.3714"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="0.00000001"
                    className="form-control"
                    name="longitude_site"
                    value={formData.longitude_site}
                    onChange={handleChange}
                    required
                    placeholder="Ex: -1.5197"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Localité</label>
                <select className="form-select" name="id_localite" value={formData.id_localite} onChange={handleChange} required>
                  <option value="">-- Sélectionnez une localité --</option>
                  {localites.map((loc) => (
                    <option key={loc.id_localite} value={loc.id_localite}>
                      {loc.nom_localite}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Opérateur</label>
                <select className="form-select" name="id_operateur" value={formData.id_operateur} onChange={handleChange} required>
                  <option value="">-- Sélectionnez un opérateur --</option>
                  {operateurs.map((op) => (
                    <option key={op.id_operateur} value={op.id_operateur}>
                      {op.nom_operateur}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Type de site</label>
                <select className="form-select" name="id_type_site" value={formData.id_type_site} onChange={handleChange} required>
                  <option value="">-- Choisissez un type --</option>
                  {typeSites.map((type) => (
                    <option key={type.id_type_site} value={type.id_type_site}>
                      {type.libelle_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Année</label>
                <input
                  type="text"
                  className="form-control"
                  name="annee_site"
                  placeholder="Exemple : 2024"
                  value={formData.annee_site}
                  onChange={handleChange}
                  required
                  pattern="\d{4}"
                  title="Veuillez entrer une année valide ex: 2024"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Trimestre</label>
                <select className="form-select" name="id_trimestre" value={formData.id_trimestre} onChange={handleChange} required>
                  <option value="">-- Choisissez un trimestre --</option>
                  {trimestres.map((tri) => (
                    <option key={tri.id_trimestre} value={tri.id_trimestre}>
                      {tri.libelle_trimestre}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-success w-100">
                💾 Enregistrer le site
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------
          Modal listant les noms (niv: régions/provinces/communes/villages)
         ------------------------- */}
      {showLevelModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-scrollable modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{levelModalTitle}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLevelModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="list-group">
                    {levelModalItems && levelModalItems.length > 0 ? (
                      levelModalItems.map((it) => (
                        <div key={it.id} className="d-flex justify-content-between align-items-center list-group-item">
                          <div>{it.name}</div>
                          <div>
                            {/* Voir subdivisions (si applicable) */}
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => {
                                // si la modal liste provient d'un niveau "regions" mais on n'a pas l'info ici,
                                // on essaye de déterminer quel type était initialement affiché par le titre.
                                // pour navigation simple on suppose:
                                if (levelModalTitle.toLowerCase().includes("région") || levelModalTitle.toLowerCase().includes("régions")) {
                                  handleLevelItemClick_ShowSub("region", it);
                                } else if (levelModalTitle.toLowerCase().includes("province") || levelModalTitle.toLowerCase().includes("provinces")) {
                                  handleLevelItemClick_ShowSub("province", it);
                                } else if (levelModalTitle.toLowerCase().includes("commune") || levelModalTitle.toLowerCase().includes("communes")) {
                                  handleLevelItemClick_ShowSub("commune", it);
                                } else {
                                  // pas de sous-niveau
                                }
                              }}
                            >
                              Voir subdivisions
                            </button>

                            {/* Voir sites */}
                            <button className="btn btn-sm btn-primary" onClick={() => {
                              // déterminer type (region/province/commune/village) via titre
                              let type = "region";
                              if (levelModalTitle.toLowerCase().includes("province")) type = "province";
                              else if (levelModalTitle.toLowerCase().includes("commune")) type = "commune";
                              else if (levelModalTitle.toLowerCase().includes("village")) type = "village";
                              handleLevelItemClick_ShowSites(type, it);
                            }}>
                              📍 Voir sites
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>Aucun élément.</div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowLevelModal(false)}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* -------------------------
          Modal affichant les sites d'un lieu
         ------------------------- */}
      {showSitesModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-modal="true">
            <div className="modal-dialog modal-dialog-scrollable modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{sitesModalTitle}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowSitesModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {sitesModalItems && sitesModalItems.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Localité</th>
                            <th>Opérateur</th>
                            <th>Type</th>
                            <th>Année</th>
                            <th>Trimestre</th>
                            <th>Lat</th>
                            <th>Lng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sitesModalItems.map((s) => (
                            <tr key={s.id_site || s.id}>
                              <td>
                                <button className="btn btn-link p-0" onClick={() => openSiteDetails(s)}>
                                  {s.nom_site}
                                </button>
                              </td>
                              <td>{s.nom_localite}</td>
                              <td>{s.nom_operateur}</td>
                              <td>{s.libelle_type || s.nom_type_site}</td>
                              <td>{s.annee_site}</td>
                              <td>{s.libelle_trimestre}</td>
                              <td>{s.latitude_site}</td>
                              <td>{s.longitude_site}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div>Aucun site trouvé pour cet emplacement.</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowSitesModal(false)}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* -------------------------
          Modal détails d'un site
         ------------------------- */}
      {showSiteDetailsModal && siteDetails && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails : {siteDetails.nom_site}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowSiteDetailsModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(siteDetails, null, 2)}</pre>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowSiteDetailsModal(false)}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Sites;
