import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Database, 
  Code2, 
  Layers, 
  GitBranch, 
  BookOpen,
  ChevronDown,
  ChevronRight,
  Trash2,
  Clock,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { OntologyQueryResult } from '@/lib/ontology-service';
import { cn } from '@/lib/utils';

interface OntologyPanelProps {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  currentQuery: OntologyQueryResult | null;
  queryHistory: OntologyQueryResult[];
  stats: {
    classes: number;
    properties: number;
    rules: number;
    individuals: number;
  } | null;
  onClearHistory: () => void;
}

export const OntologyPanel = ({
  isLoaded,
  isLoading,
  error,
  currentQuery,
  queryHistory,
  stats,
  onClearHistory
}: OntologyPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sparql: true,
    classes: true,
    properties: true,
    rules: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <Card className="glass-card h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto"></div>
            <p className="text-muted-foreground">Chargement de l'ontologie OWL...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card h-full border-destructive">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-destructive font-medium">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            Ontologie OWL
          </CardTitle>
          {isLoaded && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Chargée
            </Badge>
          )}
        </div>
        
        {/* Stats de l'ontologie */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-accent">{stats.classes}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-blue-400">{stats.properties}</p>
              <p className="text-xs text-muted-foreground">Propriétés</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-purple-400">{stats.rules}</p>
              <p className="text-xs text-muted-foreground">Règles</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-orange-400">{stats.individuals}</p>
              <p className="text-xs text-muted-foreground">Individus</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pt-0">
        <Tabs defaultValue="current" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="current" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Requête Actuelle
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Historique ({queryHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-[calc(100%-10px)]">
              {currentQuery ? (
                <div className="space-y-3 pr-4">
                  {/* Explication */}
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{currentQuery.explanation}</p>
                    </div>
                  </div>

                  {/* Requête SPARQL */}
                  <Collapsible 
                    open={expandedSections.sparql}
                    onOpenChange={() => toggleSection('sparql')}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      {expandedSections.sparql ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Code2 className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-sm">Requête SPARQL</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {currentQuery.sparqlResult.executionTime.toFixed(2)}ms
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {currentQuery.sparqlResult.queryType}
                        </Badge>
                        <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto font-mono">
                          {currentQuery.sparqlResult.query}
                        </pre>
                        
                        {/* Résultats */}
                        {currentQuery.sparqlResult.results.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              Résultats ({currentQuery.sparqlResult.results.length}):
                            </p>
                            <div className="space-y-1">
                              {currentQuery.sparqlResult.results.map((result, idx) => (
                                <div 
                                  key={idx} 
                                  className="p-2 rounded bg-muted/30 text-xs font-mono"
                                >
                                  {Object.entries(result).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                      <span className="text-blue-400">?{key}:</span>
                                      <span className="text-green-400">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Classes impliquées */}
                  <Collapsible
                    open={expandedSections.classes}
                    onOpenChange={() => toggleSection('classes')}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      {expandedSections.classes ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Layers className="w-4 h-4 text-accent" />
                      <span className="font-medium text-sm">Classes & Sous-classes</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {currentQuery.involvedClasses.length + currentQuery.involvedSubClasses.length}
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-2 pl-6">
                        {currentQuery.involvedClasses.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Classes principales:</p>
                            <div className="flex flex-wrap gap-1">
                              {currentQuery.involvedClasses.map((cls, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs bg-accent/10 border-accent/30"
                                  title={cls.comment}
                                >
                                  {cls.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {currentQuery.involvedSubClasses.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sous-classes:</p>
                            <div className="flex flex-wrap gap-1">
                              {currentQuery.involvedSubClasses.map((cls, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs bg-blue-500/10 border-blue-500/30"
                                  title={cls.comment}
                                >
                                  <GitBranch className="w-3 h-3 mr-1" />
                                  {cls.label}
                                  {cls.subClassOf && (
                                    <span className="text-muted-foreground ml-1">
                                      → {cls.subClassOf}
                                    </span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Propriétés */}
                  <Collapsible
                    open={expandedSections.properties}
                    onOpenChange={() => toggleSection('properties')}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      {expandedSections.properties ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <GitBranch className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-sm">Propriétés</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {currentQuery.involvedProperties.length}
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-1 pl-6">
                        {currentQuery.involvedProperties.map((prop, idx) => (
                          <div 
                            key={idx} 
                            className="p-2 rounded bg-muted/30 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  prop.type === 'object' 
                                    ? "bg-purple-500/10 border-purple-500/30" 
                                    : "bg-orange-500/10 border-orange-500/30"
                                )}
                              >
                                {prop.type === 'object' ? 'ObjectProperty' : 'DatatypeProperty'}
                              </Badge>
                              <span className="font-medium">{prop.label}</span>
                            </div>
                            {(prop.domain || prop.range) && (
                              <div className="mt-1 text-muted-foreground">
                                {prop.domain && <span>Domaine: {prop.domain}</span>}
                                {prop.domain && prop.range && <span> | </span>}
                                {prop.range && <span>Portée: {prop.range}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Règles SWRL */}
                  {currentQuery.involvedRules.length > 0 && (
                    <Collapsible
                      open={expandedSections.rules}
                      onOpenChange={() => toggleSection('rules')}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        {expandedSections.rules ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-sm">Règles SWRL</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {currentQuery.involvedRules.length}
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-2 pl-6">
                          {currentQuery.involvedRules.map((rule, idx) => (
                            <div 
                              key={idx} 
                              className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30"
                            >
                              <p className="font-medium text-sm">{rule.label}</p>
                              {rule.comment && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {rule.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Database className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Aucune requête en cours
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jouez un coup pour voir l'ontologie en action
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 min-h-0 mt-3">
            <div className="flex justify-end mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearHistory}
                disabled={queryHistory.length === 0}
                className="text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Effacer
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              {queryHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Clock className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Aucun historique
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {[...queryHistory].reverse().map((query, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {query.sparqlResult.queryType.split(' - ')[1]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {query.sparqlResult.executionTime.toFixed(2)}ms
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {query.explanation}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {query.involvedClasses.slice(0, 3).map((cls, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cls.label}
                          </Badge>
                        ))}
                        {query.involvedClasses.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{query.involvedClasses.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OntologyPanel;
