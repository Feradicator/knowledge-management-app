"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomNode } from "./custom-node";
import { MindMap } from "@/types/database";
import { useLearningStore } from "@/lib/store/learning-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Minus,
  Save,
  Trash2,
  Maximize2,
  Sparkles,
  Download,
  Check,
  Palette,
  Edit2,
  FolderTree,
  ListCollapse,
  Network,
  RotateCcw,
} from "lucide-react";

interface MindMapCanvasProps {
  mindMap: MindMap;
}

const nodeTypes = {
  custom: CustomNode,
};

export function MindMapCanvas({ mindMap }: MindMapCanvasProps) {
  const { updateMindMap, isOwner } = useLearningStore();

  // Convert stored nodes/edges to state
  const rawNodes: Node[] = useMemo(() => {
    return (mindMap.nodes_json || []).map((n) => ({
      id: n.id,
      type: "custom",
      position: n.position || { x: 250, y: 150 },
      data: n.data || { label: "Node" },
    }));
  }, [mindMap.id]);

  const rawEdges: Edge[] = useMemo(() => {
    return (mindMap.edges_json || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated !== undefined ? e.animated : true,
      style: { stroke: "#818cf8", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#818cf8" },
    }));
  }, [mindMap.id]);

  // Track which parent nodes are expanded
  // Initial state: expand root so all topics are visible, and expand topic nodes
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>(["root"]);
    rawNodes.forEach((n) => {
      if ((n.data as any)?.level === 1 || (n.data as any)?.hasChildren) {
        initial.add(n.id);
      }
    });
    return initial;
  });

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const all = new Set<string>();
    rawNodes.forEach((n) => all.add(n.id));
    setExpandedIds(all);
  }, [rawNodes]);

  const collapseToRoot = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Compute visible nodes based on hierarchical parent expansion
  const visibleNodes = useMemo(() => {
    const visibleIdSet = new Set<string>();

    // Pass 1: Root nodes are always visible
    rawNodes.forEach((n) => {
      const parentId = (n.data as any)?.parentId;
      if (n.id === "root" || !parentId || (n.data as any)?.isRoot) {
        visibleIdSet.add(n.id);
      }
    });

    // Pass 2: Iteratively add child nodes if their parent is visible and expanded
    let changed = true;
    while (changed) {
      changed = false;
      rawNodes.forEach((n) => {
        const parentId = (n.data as any)?.parentId;
        if (parentId && visibleIdSet.has(parentId) && expandedIds.has(parentId)) {
          if (!visibleIdSet.has(n.id)) {
            visibleIdSet.add(n.id);
            changed = true;
          }
        }
      });
    }

    return rawNodes
      .filter((n) => visibleIdSet.has(n.id))
      .map((n) => ({
        ...n,
        data: {
          ...(n.data as any),
          isExpanded: expandedIds.has(n.id),
          onToggleExpand: toggleExpand,
        },
      }));
  }, [rawNodes, expandedIds, toggleExpand]);

  // Compute visible edges connecting only visible nodes
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
    return rawEdges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
  }, [rawEdges, visibleNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(visibleNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(visibleEdges);

  // Sync visible nodes when expandedIds change
  useEffect(() => {
    setNodes(visibleNodes);
    setEdges(visibleEdges);
  }, [visibleNodes, visibleEdges, setNodes, setEdges]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Quick node addition modal
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeDesc, setNewNodeDesc] = useState("");
  const [newNodeColor, setNewNodeColor] = useState("#6366f1");

  // Connect handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#818cf8", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#818cf8" },
          },
          eds
        )
      );
      setSaveStatus("saving");
    },
    [setEdges]
  );

  const handleManualSave = () => {
    setSaveStatus("saving");
    const formattedNodes = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data as any,
    }));
    const formattedEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated,
    }));

    updateMindMap(mindMap.id, {
      nodes_json: formattedNodes,
      edges_json: formattedEdges,
    });
    setSaveStatus("saved");
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const newId = `node-${Date.now()}`;
    const xPos = selectedNode ? selectedNode.position.x + 350 : 450 + (nodes.length % 4) * 80;
    const yPos = selectedNode ? selectedNode.position.y + 40 : 200 + (nodes.length % 3) * 80;

    const newNode: Node = {
      id: newId,
      type: "custom",
      position: { x: xPos, y: yPos },
      data: {
        label: newNodeLabel,
        description: newNodeDesc,
        color: newNodeColor,
        level: selectedNode ? ((selectedNode.data as any)?.level || 0) + 1 : 1,
        parentId: selectedNode ? selectedNode.id : "root",
      },
    };

    setNodes((nds) => [...nds, newNode]);

    // Auto connect edge from parent
    const parentId = selectedNode ? selectedNode.id : "root";
    const newEdge: Edge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      animated: true,
      style: { stroke: newNodeColor, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: newNodeColor },
    };
    setEdges((eds) => [...eds, newEdge]);

    setNewNodeLabel("");
    setNewNodeDesc("");
    setIsAddNodeOpen(false);
  };

  const handleDeleteSelected = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${mindMap.title.replace(/\s+/g, "_")}_mindmap.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="relative h-[74vh] sm:h-[78vh] w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node)}
        onPaneClick={() => setSelectedNode(null)}
        fitView
        className="bg-background/95"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.2)" />
        <Controls className="rounded-xl shadow-md border border-border" />
        <MiniMap
          nodeColor={(node) => (node.data as any)?.color || "#6366f1"}
          className="rounded-xl border border-border/80 shadow-md bg-card/90 hidden sm:block"
        />

        {/* Top Floating Control Panel */}
        <Panel position="top-left" className="m-3">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg flex-wrap">
            {/* Expand / Collapse Controls */}
            <Button
              size="sm"
              variant="outline"
              onClick={expandAll}
              className="gap-1 text-xs h-8"
              title="Expand all topics and subtopics"
            >
              <Plus className="h-3.5 w-3.5" /> Expand All
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={collapseToRoot}
              className="gap-1 text-xs h-8"
              title="Collapse to main technology only"
            >
              <Minus className="h-3.5 w-3.5" /> Collapse to Tech
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJson}
              className="gap-1 text-xs h-8"
              title="Export as JSON"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>

            {isOwner && (
              <>
                <div className="h-4 w-px bg-border/80 mx-1" />

                <Button
                  size="sm"
                  onClick={() => setIsAddNodeOpen(true)}
                  className="gap-1.5 text-xs font-semibold shadow-sm h-8"
                >
                  <Plus className="h-4 w-4" /> Add Branch
                </Button>

                {selectedNode && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    className="gap-1 text-xs h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManualSave}
                  className="gap-1 text-xs h-8"
                >
                  {saveStatus === "saved" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </Panel>

        {/* Instructions Banner */}
        <Panel position="bottom-center" className="m-3 pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-card/85 backdrop-blur-md border border-border text-[11px] text-muted-foreground shadow-sm">
            💡 Click <strong>Technology</strong> or <strong>Topic</strong> cards to expand/collapse subtopics · Drag nodes freely
          </div>
        </Panel>
      </ReactFlow>

      {/* Add Node Modal */}
      <Modal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        title={selectedNode ? `Add Child Branch from "${(selectedNode.data as any)?.label}"` : "Add Concept Node"}
      >
        <form onSubmit={handleAddNode} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Branch Title</label>
            <Input
              placeholder="e.g. Refresh Token Rotation, JWT Claims, B-Tree Index"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Color Tag</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newNodeColor}
                onChange={(e) => setNewNodeColor(e.target.value)}
                className="h-9 w-12 rounded border border-input cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={newNodeColor}
                onChange={(e) => setNewNodeColor(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Description / Notes (Optional)
            </label>
            <Textarea
              placeholder="Brief explanation of this concept branch..."
              value={newNodeDesc}
              onChange={(e) => setNewNodeDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddNodeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Node to Canvas</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
