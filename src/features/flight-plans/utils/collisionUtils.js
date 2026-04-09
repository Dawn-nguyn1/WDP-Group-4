import * as turf from "@turf/turf";

/**
 * Checks if a path (waypoints) intersects with any restricted/no-fly zones.
 * @param {Array} waypoints - Array of waypoint objects {latitude, longitude, altitude}
 * @param {Array} zones - Array of zone objects {coordinates, minAltitude, maxAltitude, type, name}
 * @returns {Array} - Array of conflicts found
 */
export const validatePathAgainstZones = (waypoints, zones) => {
  if (!waypoints || waypoints.length < 2 || !zones || zones.length === 0) return [];

  const conflicts = [];
  // Create a LineString from waypoints
  const pathCoordinates = waypoints.map(wp => [wp.longitude, wp.latitude]);
  const pathLine = turf.lineString(pathCoordinates);

  zones.forEach(zone => {
    // 1. Horizontal check: Does the path intersect or is it inside the zone polygon?
    // Note: zone.coordinates is an array of {lat, lng} from WaypointEditorWithZones mapping
    const zoneCoords = zone.coordinates.map(c => [c.lng, c.lat]);
    // Ensure the polygon is closed for Turf
    if (zoneCoords[0][0] !== zoneCoords[zoneCoords.length - 1][0] || 
        zoneCoords[0][1] !== zoneCoords[zoneCoords.length - 1][1]) {
      zoneCoords.push(zoneCoords[0]);
    }
    
    const zonePolygon = turf.polygon([zoneCoords]);

    // Check if the path intersects the polygon or if any part of it is inside
    const isIntersecting = turf.booleanIntersects(pathLine, zonePolygon);

    if (isIntersecting) {
      // 2. Vertical check: Does any segment's altitude range overlap with zone's altitude range?
      // We check each segment for more precision
      for (let i = 0; i < waypoints.length - 1; i++) {
        const wp1 = waypoints[i];
        const wp2 = waypoints[i + 1];
        const segment = turf.lineString([
          [wp1.longitude, wp1.latitude],
          [wp2.longitude, wp2.latitude]
        ]);

        if (turf.booleanIntersects(segment, zonePolygon)) {
          const minPathAlt = Math.min(wp1.altitude, wp2.altitude);
          const maxPathAlt = Math.max(wp1.altitude, wp2.altitude);
          
          const zoneMin = zone.minAltitude || 0;
          const zoneMax = zone.maxAltitude;

          // Overlap check: [minPathAlt, maxPathAlt] overlaps with [zoneMin, zoneMax]
          const isAltitudeConflict = (minPathAlt <= zoneMax && maxPathAlt >= zoneMin);

          if (isAltitudeConflict) {
            conflicts.push({
              type: zone.type === 'no_fly' ? 'BLOCKING' : 'WARNING',
              zoneType: zone.type,
              zoneName: zone.name,
              message: `Đường bay đi qua ${zone.type === 'no_fly' ? 'vùng cấm' : 'vùng hạn chế'} "${zone.name}" ở độ cao ${minPathAlt}m-${maxPathAlt}m.`,
              segments: [i, i + 1]
            });
            // If it's blocking, we might want to continue to find all conflicts or stop. 
            // Let's find all to give full feedback.
          }
        }
      }
    }
  });

  return conflicts;
};

/**
 * Checks if a path intersects with other active flight plans.
 * @param {Array} waypoints - New flight plan waypoints
 * @param {Array} otherPlans - Existing active flight plans
 * @param {number} altitudeBuffer - Safety buffer in meters (default 10m)
 * @returns {Array} - Array of potential collisions
 */
export const validatePathAgainstOtherPlans = (waypoints, otherPlans, altitudeBuffer = 10) => {
  if (!waypoints || waypoints.length < 2 || !otherPlans || otherPlans.length === 0) return [];

  const conflicts = [];
  const path1Coords = waypoints.map(wp => [wp.longitude, wp.latitude]);
  const path1Line = turf.lineString(path1Coords);

  otherPlans.forEach(plan => {
    if (!plan.waypoints || plan.waypoints.length < 2) return;

    const path2Coords = plan.waypoints.map(wp => [wp.longitude, wp.latitude]);
    const path2Line = turf.lineString(path2Coords);

    // Horizontal check
    const intersection = turf.lineIntersect(path1Line, path2Line);

    if (intersection.features.length > 0) {
      // Find which segments intersect and check altitude at those points
      // For simplicity, we compare the altitudes of the segments involved
      for (let i = 0; i < waypoints.length - 1; i++) {
        const seg1A = waypoints[i];
        const seg1B = waypoints[i + 1];
        const line1 = turf.lineString([[seg1A.longitude, seg1A.latitude], [seg1B.longitude, seg1B.latitude]]);

        for (let j = 0; j < plan.waypoints.length - 1; j++) {
          const seg2A = plan.waypoints[j];
          const seg2B = plan.waypoints[j + 1];
          const line2 = turf.lineString([[seg2A.longitude, seg2A.latitude], [seg2B.longitude, seg2B.latitude]]);

          const intersect = turf.lineIntersect(line1, line2);
          if (intersect.features.length > 0) {
            // Check vertical proximity: average altitude of segments or range overlap
            const minAlt1 = Math.min(seg1A.altitude, seg1B.altitude);
            const maxAlt1 = Math.max(seg1A.altitude, seg1B.altitude);
            const minAlt2 = Math.min(seg2A.altitude, seg2B.altitude);
            const maxAlt2 = Math.max(seg2A.altitude, seg2B.altitude);

            // Overlap check with buffer
            const isVerticalConflict = (minAlt1 - altitudeBuffer <= maxAlt2 && maxAlt1 + altitudeBuffer >= minAlt2);

            if (isVerticalConflict) {
              conflicts.push({
                type: 'WARNING',
                planName: plan.name || `Plan #${plan._id?.slice(-6)}`,
                message: `Có khả năng đụng độ với kế hoạch bay "${plan.name || plan._id}" (chênh lệch độ cao < ${altitudeBuffer}m).`,
                segments: [i, i + 1]
              });
            }
          }
        }
      }
    }
  });

  // Unique messages only
  const uniqueConflicts = [];
  const seen = new Set();
  conflicts.forEach(c => {
    if (!seen.has(c.message)) {
      uniqueConflicts.push(c);
      seen.add(c.message);
    }
  });

  return uniqueConflicts;
};
