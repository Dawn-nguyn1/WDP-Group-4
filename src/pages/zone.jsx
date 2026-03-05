import React, { useState } from 'react';
import Map from '../components/user/map';
import ZoneForm from '../components/zone/zone.form';
import '../components/user/user.css';

const ZonePage = () => {
    const [reloadZones, setReloadZones] = useState(null);

    const handleReloadCallback = (fetchFunction) => {
        if (fetchFunction && typeof fetchFunction === 'function') {
            setReloadZones(() => fetchFunction);
        }
    };

    return (
        <div className="user-page-container">
            <div className="page-header">
                <h1 className="page-title">Zone Management</h1>
                <p className="page-subtitle">Manage and draw no-fly zones on the map</p>
            </div>

            <ZoneForm loadZones={reloadZones} />

            <Map onReloadCallback={handleReloadCallback} />
        </div>
    );
};

export default ZonePage;
