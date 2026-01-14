import * as $rdf from 'rdflib';

// Namespace pour l'ontologie d'échecs
const CHESS = $rdf.Namespace('http://www.exemple.org/chess#');
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const RDFS = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const OWL = $rdf.Namespace('http://www.w3.org/2002/07/owl#');
const SWRL = $rdf.Namespace('http://www.w3.org/2003/11/swrl#');

// Types pour contourner les problèmes de typage de rdflib
type RDFNode = $rdf.NamedNode | $rdf.BlankNode;
type RDFStore = $rdf.Store;

export interface OntologyClass {
  uri: string;
  label: string;
  comment?: string;
  subClassOf?: string;
}

export interface OntologyProperty {
  uri: string;
  label: string;
  domain?: string;
  range?: string;
  type: 'object' | 'datatype';
}

export interface OntologyRule {
  label: string;
  comment: string;
}

export interface SPARQLResult {
  query: string;
  queryType: string;
  results: Record<string, string>[];
  executionTime: number;
}

export interface OntologyQueryResult {
  sparqlResult: SPARQLResult;
  involvedClasses: OntologyClass[];
  involvedSubClasses: OntologyClass[];
  involvedProperties: OntologyProperty[];
  involvedRules: OntologyRule[];
  explanation: string;
}

export type ChessEventType = 
  | 'move' 
  | 'capture' 
  | 'check' 
  | 'checkmate' 
  | 'castling' 
  | 'promotion' 
  | 'stalemate'
  | 'piece_select'
  | 'game_start'
  | 'turn_change';

export interface ChessEvent {
  type: ChessEventType;
  piece?: string;
  pieceColor?: 'white' | 'black';
  from?: string;
  to?: string;
  capturedPiece?: string;
  promotionPiece?: string;
  currentPlayer?: 'white' | 'black';
}

class OntologyService {
  private store: $rdf.Store;
  private fetcher: $rdf.Fetcher;
  private isLoaded: boolean = false;
  private ontologyUri: string = '';

  constructor() {
    this.store = $rdf.graph();
    this.fetcher = new $rdf.Fetcher(this.store);
  }

  async loadOntology(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      const owlContent = await response.text();
      
      this.ontologyUri = 'http://www.exemple.org/chess';
      $rdf.parse(owlContent, this.store, this.ontologyUri, 'application/rdf+xml');
      
      this.isLoaded = true;
      console.log('Ontologie chargée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ontologie:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  // Récupérer toutes les classes de l'ontologie
  getAllClasses(): OntologyClass[] {
    const classes: OntologyClass[] = [];
    const classStatements = this.store.match(null, RDF('type'), OWL('Class'));
    
    classStatements.forEach((stmt) => {
      const uri = stmt.subject.value;
      if (uri.startsWith('http://www.exemple.org/chess#')) {
        const label = this.getLabel(stmt.subject) || this.extractLocalName(uri);
        const comment = this.getComment(stmt.subject);
        const subClassOf = this.getSubClassOf(stmt.subject);
        
        classes.push({ uri, label, comment, subClassOf });
      }
    });
    
    return classes;
  }

  // Récupérer toutes les propriétés
  getAllProperties(): OntologyProperty[] {
    const properties: OntologyProperty[] = [];
    
    // Object Properties
    const objectProps = this.store.match(null, RDF('type'), OWL('ObjectProperty'));
    objectProps.forEach((stmt) => {
      const uri = stmt.subject.value;
      if (uri.startsWith('http://www.exemple.org/chess#')) {
        properties.push({
          uri,
          label: this.getLabel(stmt.subject) || this.extractLocalName(uri),
          domain: this.getDomain(stmt.subject),
          range: this.getRange(stmt.subject),
          type: 'object'
        });
      }
    });
    
    // Datatype Properties
    const dataProps = this.store.match(null, RDF('type'), OWL('DatatypeProperty'));
    dataProps.forEach((stmt) => {
      const uri = stmt.subject.value;
      if (uri.startsWith('http://www.exemple.org/chess#')) {
        properties.push({
          uri,
          label: this.getLabel(stmt.subject) || this.extractLocalName(uri),
          domain: this.getDomain(stmt.subject),
          range: this.getRange(stmt.subject),
          type: 'datatype'
        });
      }
    });
    
    return properties;
  }

  // Récupérer toutes les règles SWRL
  getAllRules(): OntologyRule[] {
    const rules: OntologyRule[] = [];
    const ruleStatements = this.store.match(null, RDF('type'), SWRL('Imp'));
    
    ruleStatements.forEach((stmt) => {
      const label = this.getLabel(stmt.subject) || 'Règle sans nom';
      const comment = this.getComment(stmt.subject) || '';
      rules.push({ label, comment });
    });
    
    return rules;
  }

  // Générer et exécuter une requête SPARQL basée sur un événement d'échecs
  queryForChessEvent(event: ChessEvent): OntologyQueryResult {
    const startTime = performance.now();
    let query = '';
    let queryType = '';
    let results: Record<string, string>[] = [];
    let involvedClasses: OntologyClass[] = [];
    let involvedSubClasses: OntologyClass[] = [];
    let involvedProperties: OntologyProperty[] = [];
    let involvedRules: OntologyRule[] = [];
    let explanation = '';

    switch (event.type) {
      case 'game_start':
        query = this.buildGameStartQuery();
        queryType = 'SELECT - Initialisation de la partie';
        results = this.executeSimulatedQuery('game_start');
        involvedClasses = this.getClassesByNames(['Partie', 'Plateau', 'Joueur', 'Piece']);
        involvedSubClasses = this.getClassesByNames(['JoueurBlanc', 'JoueurNoir', 'Roi', 'Reine', 'TourPiece', 'Fou', 'Cavalier', 'Pion']);
        involvedProperties = this.getPropertiesByNames(['aPlateau', 'aJoueurBlanc', 'aJoueurNoir', 'aEtat', 'possedePiece']);
        explanation = "Initialisation de la partie : création du plateau, des joueurs et placement des pièces selon l'ontologie.";
        break;

      case 'piece_select':
        query = this.buildPieceSelectQuery(event);
        queryType = 'SELECT - Sélection de pièce';
        results = this.executeSimulatedQuery('piece_select', event);
        involvedClasses = this.getClassesByNames(['Piece', 'Case']);
        involvedSubClasses = this.getPieceClass(event.piece || '');
        involvedProperties = this.getPropertiesByNames(['estSurCase', 'peutAtteindreCase', 'appartientA', 'couleur']);
        explanation = `Sélection d'une pièce : interrogation des cases accessibles selon les règles de déplacement de ${this.getPieceFrenchName(event.piece || '')}.`;
        break;

      case 'move':
        query = this.buildMoveQuery(event);
        queryType = 'SELECT - Déplacement';
        results = this.executeSimulatedQuery('move', event);
        involvedClasses = this.getClassesByNames(['Coup', 'Piece', 'Case']);
        involvedSubClasses = [...this.getClassesByNames(['CoupNormal']), ...this.getPieceClass(event.piece || '')];
        involvedProperties = this.getPropertiesByNames(['deplacePiece', 'caseDepart', 'caseArrivee', 'estValide', 'aBouge', 'notation']);
        involvedRules = this.getRulesByNames(['Regle Piece a Bouge']);
        explanation = `Déplacement de ${this.getPieceFrenchName(event.piece || '')} de ${event.from} vers ${event.to}. Mise à jour de la position et marquage comme ayant bougé.`;
        break;

      case 'capture':
        query = this.buildCaptureQuery(event);
        queryType = 'SELECT - Capture';
        results = this.executeSimulatedQuery('capture', event);
        involvedClasses = this.getClassesByNames(['Coup', 'Capture', 'Piece', 'Case']);
        involvedSubClasses = [...this.getPieceClass(event.piece || ''), ...this.getPieceClass(event.capturedPiece || '')];
        involvedProperties = this.getPropertiesByNames(['capturePiece', 'estCapturee', 'menacePiece', 'caseArrivee']);
        involvedRules = this.getRulesByNames(['Regle Capture', 'Regle Piece Capturee', 'Regle Menace']);
        explanation = `Capture : ${this.getPieceFrenchName(event.piece || '')} capture ${this.getPieceFrenchName(event.capturedPiece || '')} en ${event.to}. La pièce capturée est retirée du plateau.`;
        break;

      case 'check':
        query = this.buildCheckQuery(event);
        queryType = 'SELECT - Échec';
        results = this.executeSimulatedQuery('check', event);
        involvedClasses = this.getClassesByNames(['EtatPartie', 'Echec', 'Roi', 'Piece']);
        involvedSubClasses = this.getClassesByNames(['Echec']);
        involvedProperties = this.getPropertiesByNames(['aEtat', 'menacePiece', 'peutAtteindreCase', 'estSurCase', 'aRoi']);
        involvedRules = this.getRulesByNames(['Regle Echec', 'Regle Menace']);
        explanation = `Échec ! Le Roi ${event.pieceColor === 'white' ? 'blanc' : 'noir'} est menacé. Une pièce adverse peut atteindre sa case.`;
        break;

      case 'checkmate':
        query = this.buildCheckmateQuery(event);
        queryType = 'SELECT - Échec et Mat';
        results = this.executeSimulatedQuery('checkmate', event);
        involvedClasses = this.getClassesByNames(['EtatPartie', 'EchecEtMat', 'Roi']);
        involvedSubClasses = this.getClassesByNames(['EchecEtMat', 'Echec']);
        involvedProperties = this.getPropertiesByNames(['aEtat', 'menacePiece', 'peutAtteindreCase']);
        involvedRules = this.getRulesByNames(['Regle Echec']);
        explanation = `Échec et Mat ! Le Roi est en échec et aucune échappatoire n'est possible. Fin de la partie.`;
        break;

      case 'castling':
        query = this.buildCastlingQuery(event);
        queryType = 'SELECT - Roque';
        results = this.executeSimulatedQuery('castling', event);
        involvedClasses = this.getClassesByNames(['Coup', 'Roque', 'Roi', 'TourPiece']);
        involvedSubClasses = this.getClassesByNames(['RoquePetit', 'RoqueGrand']);
        involvedProperties = this.getPropertiesByNames(['aBouge', 'estValide', 'deplacePiece']);
        involvedRules = this.getRulesByNames(['Regle Roque Valide', 'Regle Piece a Bouge']);
        explanation = `Roque effectué : le Roi et la Tour échangent leurs positions. Possible uniquement si aucun des deux n'a bougé.`;
        break;

      case 'promotion':
        query = this.buildPromotionQuery(event);
        queryType = 'SELECT - Promotion';
        results = this.executeSimulatedQuery('promotion', event);
        involvedClasses = this.getClassesByNames(['Coup', 'Promotion', 'Pion']);
        involvedSubClasses = [...this.getClassesByNames(['Promotion']), ...this.getPieceClass(event.promotionPiece || 'queen')];
        involvedProperties = this.getPropertiesByNames(['promeutEn', 'rangee', 'estSurCase']);
        involvedRules = this.getRulesByNames(['Regle Promotion Pion Blanc', 'Regle Promotion Pion Noir']);
        explanation = `Promotion du Pion en ${this.getPieceFrenchName(event.promotionPiece || 'queen')} ! Le pion a atteint la dernière rangée.`;
        break;

      case 'stalemate':
        query = this.buildStalemateQuery(event);
        queryType = 'SELECT - Pat';
        results = this.executeSimulatedQuery('stalemate', event);
        involvedClasses = this.getClassesByNames(['EtatPartie', 'Pat']);
        involvedSubClasses = this.getClassesByNames(['Pat']);
        involvedProperties = this.getPropertiesByNames(['aEtat']);
        explanation = `Pat ! Aucun coup légal possible mais le Roi n'est pas en échec. La partie est nulle.`;
        break;

      case 'turn_change':
        query = this.buildTurnChangeQuery(event);
        queryType = 'SELECT - Changement de tour';
        results = this.executeSimulatedQuery('turn_change', event);
        involvedClasses = this.getClassesByNames(['Tour', 'Joueur']);
        involvedSubClasses = this.getClassesByNames([event.currentPlayer === 'white' ? 'JoueurBlanc' : 'JoueurNoir']);
        involvedProperties = this.getPropertiesByNames(['joueurActif', 'tourSuivant', 'numeroTour']);
        explanation = `Changement de tour : c'est maintenant au joueur ${event.currentPlayer === 'white' ? 'Blanc' : 'Noir'} de jouer.`;
        break;

      default:
        query = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10';
        queryType = 'SELECT - Requête générale';
    }

    const endTime = performance.now();

    return {
      sparqlResult: {
        query,
        queryType,
        results,
        executionTime: endTime - startTime
      },
      involvedClasses,
      involvedSubClasses,
      involvedProperties,
      involvedRules,
      explanation
    };
  }

  // Méthodes de construction de requêtes SPARQL
  private buildGameStartQuery(): string {
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?partie ?plateau ?joueurBlanc ?joueurNoir ?etat
WHERE {
  ?partie rdf:type chess:Partie .
  ?partie chess:aPlateau ?plateau .
  ?partie chess:aJoueurBlanc ?joueurBlanc .
  ?partie chess:aJoueurNoir ?joueurNoir .
  ?partie chess:aEtat ?etat .
}`;
  }

  private buildPieceSelectQuery(event: ChessEvent): string {
    const pieceClass = this.getPieceOntologyClass(event.piece || '');
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?piece ?case ?casesAccessibles ?couleur
WHERE {
  ?piece rdf:type chess:${pieceClass} .
  ?piece chess:estSurCase ?case .
  ?piece chess:couleur ?couleur .
  ?piece chess:peutAtteindreCase ?casesAccessibles .
  FILTER(?couleur = "${event.pieceColor === 'white' ? 'blanc' : 'noir'}")
}`;
  }

  private buildMoveQuery(event: ChessEvent): string {
    const pieceClass = this.getPieceOntologyClass(event.piece || '');
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?coup ?piece ?caseDepart ?caseArrivee ?notation
WHERE {
  ?coup rdf:type chess:CoupNormal .
  ?coup chess:deplacePiece ?piece .
  ?piece rdf:type chess:${pieceClass} .
  ?coup chess:caseDepart ?caseDepart .
  ?coup chess:caseArrivee ?caseArrivee .
  ?caseDepart chess:coord "${event.from}" .
  ?caseArrivee chess:coord "${event.to}" .
  ?coup chess:notation ?notation .
}`;
  }

  private buildCaptureQuery(event: ChessEvent): string {
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?coup ?pieceAttaquante ?pieceCapturee ?case
WHERE {
  ?coup rdf:type chess:Capture .
  ?coup chess:deplacePiece ?pieceAttaquante .
  ?coup chess:capturePiece ?pieceCapturee .
  ?coup chess:caseArrivee ?case .
  ?case chess:coord "${event.to}" .
  ?pieceCapturee chess:estCapturee true .
}`;
  }

  private buildCheckQuery(event: ChessEvent): string {
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?roi ?caseRoi ?piecesMenacantes
WHERE {
  ?roi rdf:type chess:Roi .
  ?roi chess:couleur "${event.pieceColor === 'white' ? 'blanc' : 'noir'}" .
  ?roi chess:estSurCase ?caseRoi .
  ?piecesMenacantes chess:peutAtteindreCase ?caseRoi .
  ?piecesMenacantes chess:menacePiece ?roi .
}`;
  }

  private buildCheckmateQuery(event: ChessEvent): string {
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?partie ?etat ?roiMat
WHERE {
  ?partie rdf:type chess:Partie .
  ?partie chess:aEtat ?etat .
  ?etat rdf:type chess:EchecEtMat .
  ?roiMat rdf:type chess:Roi .
  ?roiMat chess:couleur "${event.pieceColor === 'white' ? 'blanc' : 'noir'}" .
}`;
  }

  private buildCastlingQuery(event: ChessEvent): string {
    const roqueType = event.to?.includes('g') ? 'RoquePetit' : 'RoqueGrand';
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?coup ?roi ?tour ?estValide
WHERE {
  ?coup rdf:type chess:${roqueType} .
  ?coup chess:deplacePiece ?roi .
  ?roi rdf:type chess:Roi .
  ?roi chess:aBouge false .
  ?tour rdf:type chess:TourPiece .
  ?tour chess:aBouge false .
  ?coup chess:estValide ?estValide .
}`;
  }

  private buildPromotionQuery(event: ChessEvent): string {
    const newPieceClass = this.getPieceOntologyClass(event.promotionPiece || 'queen');
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?coup ?pion ?nouvellePiece ?case
WHERE {
  ?coup rdf:type chess:Promotion .
  ?coup chess:deplacePiece ?pion .
  ?pion rdf:type chess:Pion .
  ?coup chess:promeutEn ?nouvellePiece .
  ?nouvellePiece rdf:type chess:${newPieceClass} .
  ?coup chess:caseArrivee ?case .
  ?case chess:rangee ?rangee .
  FILTER(?rangee = 8 || ?rangee = 1)
}`;
  }

  private buildStalemateQuery(event: ChessEvent): string {
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?partie ?etat ?joueur
WHERE {
  ?partie rdf:type chess:Partie .
  ?partie chess:aEtat ?etat .
  ?etat rdf:type chess:Pat .
  ?partie chess:aTourActuel ?tour .
  ?tour chess:joueurActif ?joueur .
}`;
  }

  private buildTurnChangeQuery(event: ChessEvent): string {
    const joueurClass = event.currentPlayer === 'white' ? 'JoueurBlanc' : 'JoueurNoir';
    return `PREFIX chess: <http://www.exemple.org/chess#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?tour ?joueurActif ?numeroTour
WHERE {
  ?tour rdf:type chess:Tour .
  ?tour chess:joueurActif ?joueurActif .
  ?joueurActif rdf:type chess:${joueurClass} .
  ?tour chess:numeroTour ?numeroTour .
}`;
  }

  // Simulation de résultats de requête
  private executeSimulatedQuery(type: string, event?: ChessEvent): Record<string, string>[] {
    switch (type) {
      case 'game_start':
        return [
          { partie: 'chess:Partie001', plateau: 'chess:PlateauStandard', joueurBlanc: 'chess:JoueurBlanc', joueurNoir: 'chess:JoueurNoir', etat: 'chess:EnCours' }
        ];
      case 'piece_select':
        return [
          { piece: `chess:${this.getPieceOntologyClass(event?.piece || '')}`, case: `chess:Case_${event?.from}`, couleur: event?.pieceColor === 'white' ? 'blanc' : 'noir' }
        ];
      case 'move':
        return [
          { coup: 'chess:CoupNormal', piece: `chess:${this.getPieceOntologyClass(event?.piece || '')}`, caseDepart: `chess:Case_${event?.from}`, caseArrivee: `chess:Case_${event?.to}`, notation: `${event?.from}-${event?.to}` }
        ];
      case 'capture':
        return [
          { coup: 'chess:Capture', pieceAttaquante: `chess:${this.getPieceOntologyClass(event?.piece || '')}`, pieceCapturee: `chess:${this.getPieceOntologyClass(event?.capturedPiece || '')}`, case: `chess:Case_${event?.to}` }
        ];
      case 'check':
        return [
          { roi: 'chess:Roi', caseRoi: `chess:Case_${event?.to}`, piecesMenacantes: `chess:${this.getPieceOntologyClass(event?.piece || '')}` }
        ];
      case 'checkmate':
        return [
          { partie: 'chess:Partie001', etat: 'chess:EchecEtMat', roiMat: 'chess:Roi' }
        ];
      case 'castling':
        return [
          { coup: event?.to?.includes('g') ? 'chess:RoquePetit' : 'chess:RoqueGrand', roi: 'chess:Roi', tour: 'chess:TourPiece', estValide: 'true' }
        ];
      case 'promotion':
        return [
          { coup: 'chess:Promotion', pion: 'chess:Pion', nouvellePiece: `chess:${this.getPieceOntologyClass(event?.promotionPiece || 'queen')}`, case: `chess:Case_${event?.to}` }
        ];
      case 'stalemate':
        return [
          { partie: 'chess:Partie001', etat: 'chess:Pat', joueur: event?.currentPlayer === 'white' ? 'chess:JoueurBlanc' : 'chess:JoueurNoir' }
        ];
      case 'turn_change':
        return [
          { tour: 'chess:Tour', joueurActif: event?.currentPlayer === 'white' ? 'chess:JoueurBlanc' : 'chess:JoueurNoir', numeroTour: '1' }
        ];
      default:
        return [];
    }
  }

  // Méthodes utilitaires - utilisation de unknown pour contourner les problèmes de typage rdflib
  private getLabel(node: unknown): string | undefined {
    try {
      const labels = this.store.match(node as $rdf.NamedNode, RDFS('label'), null);
      return labels.length > 0 ? labels[0].object.value : undefined;
    } catch {
      return undefined;
    }
  }

  private getComment(node: unknown): string | undefined {
    try {
      const comments = this.store.match(node as $rdf.NamedNode, RDFS('comment'), null);
      return comments.length > 0 ? comments[0].object.value : undefined;
    } catch {
      return undefined;
    }
  }

  private getSubClassOf(node: unknown): string | undefined {
    try {
      const subClassOf = this.store.match(node as $rdf.NamedNode, RDFS('subClassOf'), null);
      return subClassOf.length > 0 ? this.extractLocalName(subClassOf[0].object.value) : undefined;
    } catch {
      return undefined;
    }
  }

  private getDomain(node: unknown): string | undefined {
    try {
      const domain = this.store.match(node as $rdf.NamedNode, RDFS('domain'), null);
      return domain.length > 0 ? this.extractLocalName(domain[0].object.value) : undefined;
    } catch {
      return undefined;
    }
  }

  private getRange(node: unknown): string | undefined {
    try {
      const range = this.store.match(node as $rdf.NamedNode, RDFS('range'), null);
      return range.length > 0 ? this.extractLocalName(range[0].object.value) : undefined;
    } catch {
      return undefined;
    }
  }

  private extractLocalName(uri: string): string {
    const hashIndex = uri.lastIndexOf('#');
    const slashIndex = uri.lastIndexOf('/');
    const index = Math.max(hashIndex, slashIndex);
    return index >= 0 ? uri.substring(index + 1) : uri;
  }

  private getClassesByNames(names: string[]): OntologyClass[] {
    const allClasses = this.getAllClasses();
    return allClasses.filter(c => {
      const localName = this.extractLocalName(c.uri);
      return names.includes(localName) || names.includes(c.label);
    });
  }

  private getPropertiesByNames(names: string[]): OntologyProperty[] {
    const allProps = this.getAllProperties();
    return allProps.filter(p => {
      const localName = this.extractLocalName(p.uri);
      return names.includes(localName) || names.includes(p.label);
    });
  }

  private getRulesByNames(names: string[]): OntologyRule[] {
    const allRules = this.getAllRules();
    return allRules.filter(r => names.some(n => r.label.includes(n) || n.includes(r.label)));
  }

  private getPieceClass(piece: string): OntologyClass[] {
    const pieceMap: Record<string, string> = {
      'king': 'Roi',
      'queen': 'Reine',
      'rook': 'TourPiece',
      'bishop': 'Fou',
      'knight': 'Cavalier',
      'pawn': 'Pion'
    };
    const className = pieceMap[piece] || piece;
    return this.getClassesByNames([className]);
  }

  private getPieceOntologyClass(piece: string): string {
    const pieceMap: Record<string, string> = {
      'king': 'Roi',
      'queen': 'Reine',
      'rook': 'TourPiece',
      'bishop': 'Fou',
      'knight': 'Cavalier',
      'pawn': 'Pion'
    };
    return pieceMap[piece] || 'Piece';
  }

  private getPieceFrenchName(piece: string): string {
    const pieceMap: Record<string, string> = {
      'king': 'Roi',
      'queen': 'Dame',
      'rook': 'Tour',
      'bishop': 'Fou',
      'knight': 'Cavalier',
      'pawn': 'Pion'
    };
    return pieceMap[piece] || piece;
  }

  // Méthode pour obtenir les statistiques de l'ontologie
  getOntologyStats(): { classes: number; properties: number; rules: number; individuals: number } {
    const classes = this.getAllClasses().length;
    const properties = this.getAllProperties().length;
    const rules = this.getAllRules().length;
    
    // Compter les individus
    const individuals = this.store.match(null, RDF('type'), null)
      .filter(stmt => !stmt.object.value.includes('owl#') && !stmt.object.value.includes('swrl#'))
      .length;
    
    return { classes, properties, rules, individuals };
  }
}

// Export singleton
export const ontologyService = new OntologyService();
export default ontologyService;
