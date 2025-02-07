import React, { useState, createContext, useEffect } from 'react';
import { handleError, getOrganization } from '../api/apiUtils';
import api from '../api/treeTrackerApi';
import * as loglevel from 'loglevel';

const log = loglevel.getLogger('../context/CaptureDetailContext');

const API_ROOT = process.env.REACT_APP_API_ROOT;
const QUERY_API = process.env.REACT_APP_QUERY_API_ROOT;

export const CaptureDetailContext = createContext({
  capture: null,
  species: null,
  tags: [],
  getCaptureDetail: () => {},
  getSpecies: () => {},
  reset: () => {},
});

const STATE_EMPTY = {
  capture: null,
  species: null,
  tags: [],
};

export function CaptureDetailProvider(props) {
  const [state, setState] = useState(STATE_EMPTY);

  useEffect(() => {
    getSpecies(state.capture?.species_id);
  }, [state.capture]);

  // STATE HELPER FUNCTIONS

  function reset() {
    setState(STATE_EMPTY);
  }

  // EVENT HANDLERS

  const getCaptureDetail = async (id, page) => {
    const BASE_URL = {
      LEGACY: `${API_ROOT}/api/${getOrganization()}trees`,
      CAPTURES: `${QUERY_API}/v2/captures`,
      VERIFY: `${QUERY_API}/raw-captures`,
    };

    try {
      if (!id) {
        log.debug('getCapture called with no reference_id');
      } else {
        const query = `${BASE_URL[page]}`;

        return api.getCaptureById(query, id).then((capture) => {
          setState({ ...state, capture });
          return capture;
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getSpecies = async (speciesId) => {
    if (speciesId == null) {
      return Promise.resolve(STATE_EMPTY.species);
    }

    return api.getSpeciesById(speciesId).then((species) => {
      setState({ ...state, species });
      return species;
    });
  };

  const value = {
    capture: state.capture,
    species: state.species,
    tags: state.tags,
    getCaptureDetail,
    getSpecies,
    reset,
  };

  return (
    <CaptureDetailContext.Provider value={value}>
      {props.children}
    </CaptureDetailContext.Provider>
  );
}
