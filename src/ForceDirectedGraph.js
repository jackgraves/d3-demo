import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function ForceDirectedGraph() {
  const [nodes, setNodes] = useState([{ id: 0 }]);
  const [links, setLinks] = useState([]);
  const [isSpokeMode, setIsSpokeMode] = useState(false);
  const svgRef = useRef(null);

  const addNode = () => {
    setNodes((prevNodes) => [...prevNodes, { id: prevNodes.length }]);
  };

  const switchMode = () => {
    setIsSpokeMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    const width = 800;
    const height = 500;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#ffffff");

    svg.selectAll("*").remove();

    let newLinks;
    if (isSpokeMode) {
      newLinks = nodes.slice(1).map((node) => ({ source: 0, target: node.id }));
    } else {
      newLinks = nodes.flatMap((source, i) =>
        nodes.slice(i + 1).map((target) => ({ source: source.id, target: target.id }))
      );
    }
    setLinks(newLinks);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(newLinks)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))
      .on("tick", ticked);

    const link = svg
      .append("g")
      .attr("stroke", "#000000")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(newLinks)
      .enter()
      .append("line")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .attr("stroke", "#000000")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "#1d4ed8")
      .call(
        d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    svg.append("text")
      .attr("x", 10)
      .attr("y", height - 20)
      .attr("font-size", "16px")
      .attr("fill", "#000000")
      .text(`Nodes: ${nodes.length}, Connections: ${newLinks.length}`);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, isSpokeMode]);

  return (
    <div className="flex flex-col items-start p-4">
      <svg ref={svgRef}></svg>
      <div className="mt-4 space-x-2">
        <button onClick={addNode}>Add Node</button>
        <button onClick={switchMode}>{isSpokeMode ? "Switch to Full Mesh" : "Switch to Spoke"}</button>
      </div>
    </div>
  );
}
