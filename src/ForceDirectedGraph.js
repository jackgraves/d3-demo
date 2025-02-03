import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function ForceDirectedGraph() {
  const [nodes, setNodes] = useState([{ id: 0 }]);
  const svgRef = useRef(null);

  const addNode = () => {
    setNodes((prevNodes) => [...prevNodes, { id: prevNodes.length }]);
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

    const links = nodes.flatMap((source, i) =>
      nodes.slice(i + 1).map((target) => ({ source: source.id, target: target.id }))
    );

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    const link = svg
      .append("g")
      .attr("stroke", "#000000")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
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
      .attr("x", 0)
      .attr("y", 30)
      .attr("font-size", "24px")
      .attr("fill", "#000000")
      .text(`Nodes: ${nodes.length}, Connections: ${links.length}`);

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
  }, [nodes]);

  return (
    <div className="flex flex-col items-center p-4">
      <button onClick={addNode} className="mb-4 self-start">
        Add Node
      </button>
      <svg ref={svgRef}></svg>
    </div>
  );
}
