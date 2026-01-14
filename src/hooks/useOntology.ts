import { useState, useEffect, useCallback } from 'react';
import ontologyService, { 
  OntologyQueryResult, 
  ChessEvent,
  OntologyClass,
  OntologyProperty,
  OntologyRule
} from '@/lib/ontology-service';

export interface OntologyState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  queryHistory: OntologyQueryResult[];
  currentQuery: OntologyQueryResult | null;
  stats: {
    classes: number;
    properties: number;
    rules: number;
    individuals: number;
  } | null;
}

export const useOntology = () => {
  const [state, setState] = useState<OntologyState>({
    isLoaded: false,
    isLoading: false,
    error: null,
    queryHistory: [],
    currentQuery: null,
    stats: null
  });

  // Charger l'ontologie au montage
  useEffect(() => {
    const loadOntology = async () => {
      if (ontologyService.isReady()) {
        setState(prev => ({
          ...prev,
          isLoaded: true,
          stats: ontologyService.getOntologyStats()
        }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const success = await ontologyService.loadOntology('/JeuEchec.owl');
        
        if (success) {
          const stats = ontologyService.getOntologyStats();
          setState(prev => ({
            ...prev,
            isLoaded: true,
            isLoading: false,
            stats
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Échec du chargement de l\'ontologie'
          }));
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
        }));
      }
    };

    loadOntology();
  }, []);

  // Exécuter une requête basée sur un événement d'échecs
  const queryForEvent = useCallback((event: ChessEvent): OntologyQueryResult | null => {
    if (!ontologyService.isReady()) {
      console.warn('Ontologie non chargée');
      return null;
    }

    const result = ontologyService.queryForChessEvent(event);
    
    setState(prev => ({
      ...prev,
      currentQuery: result,
      queryHistory: [...prev.queryHistory, result].slice(-20) // Garder les 20 dernières requêtes
    }));

    return result;
  }, []);

  // Récupérer toutes les classes
  const getAllClasses = useCallback((): OntologyClass[] => {
    if (!ontologyService.isReady()) return [];
    return ontologyService.getAllClasses();
  }, []);

  // Récupérer toutes les propriétés
  const getAllProperties = useCallback((): OntologyProperty[] => {
    if (!ontologyService.isReady()) return [];
    return ontologyService.getAllProperties();
  }, []);

  // Récupérer toutes les règles
  const getAllRules = useCallback((): OntologyRule[] => {
    if (!ontologyService.isReady()) return [];
    return ontologyService.getAllRules();
  }, []);

  // Effacer l'historique des requêtes
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      queryHistory: [],
      currentQuery: null
    }));
  }, []);

  return {
    ...state,
    queryForEvent,
    getAllClasses,
    getAllProperties,
    getAllRules,
    clearHistory
  };
};

export default useOntology;
