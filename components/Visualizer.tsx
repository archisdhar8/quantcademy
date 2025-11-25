import React, { useMemo } from 'react';
import { VisualData } from '../types';

interface VisualizerProps {
  data: VisualData;
}

const Visualizer: React.FC<VisualizerProps> = ({ data }) => {
  // Safe access for data structure
  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  // Config
  const rows = 3;
  const cols = 3;
  
  // Helpers to calculate positions
  // We use percentages to be responsive
  const getPos = (r: number, c: number) => {
    // r, c are 0-indexed. 
    // r0 -> 16%, r1 -> 50%, r2 -> 84%
    // c0 -> 16%, c1 -> 50%, c2 -> 84%
    const y = (r * 33) + 16;
    const x = (c * 33) + 16;
    return { x, y };
  };

  const getNodeStyle = (r: number, c: number) => {
    const { x, y } = getPos(r, c);
    return {
      top: `${y}%`,
      left: `${x}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="relative w-full h-[320px] bg-slate-900 rounded-lg border border-slate-800 overflow-hidden select-none my-4 shadow-inner">
      {/* Grid Lines (Background decoration) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="w-full h-1/3 border-b border-slate-500"></div>
         <div className="w-full h-1/3 border-b border-slate-500 top-1/3 absolute"></div>
         <div className="h-full w-1/3 border-r border-slate-500 absolute left-0 top-0"></div>
         <div className="h-full w-1/3 border-r border-slate-500 absolute left-1/3 top-0"></div>
      </div>

      {/* SVG Layer for Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead-emerald" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
          </marker>
          <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
          <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
        </defs>
        {edges.map((edge, idx) => {
          const startNode = nodes.find(n => n.id === edge.from);
          const endNode = nodes.find(n => n.id === edge.to);
          
          if (!startNode || !endNode) return null;

          const start = getPos(startNode.row, startNode.col);
          const end = getPos(endNode.row, endNode.col);

          // Color logic
          let stroke = '#94a3b8'; // default slate
          let marker = '';
          if (edge.color === 'emerald') { stroke = '#10b981'; marker = 'url(#arrowhead-emerald)'; }
          if (edge.color === 'blue') { stroke = '#3b82f6'; marker = 'url(#arrowhead-blue)'; }
          if (edge.color === 'red') { stroke = '#ef4444'; marker = 'url(#arrowhead-red)'; }

          return (
            <g key={`${edge.from}-${edge.to}-${idx}`}>
              {/* The Line */}
              <line 
                x1={`${start.x}%`} 
                y1={`${start.y}%`} 
                x2={`${end.x}%`} 
                y2={`${end.y}%`} 
                stroke={stroke} 
                strokeWidth="2" 
                strokeDasharray="4 4"
                markerEnd={marker}
                opacity={0.6}
              />
              
              {/* Moving Particle Animation */}
              <circle r="4" fill={stroke}>
                <animateMotion 
                   dur="2s" 
                   repeatCount="indefinite"
                   path={`M${start.x * 6},${start.y * 3} L${end.x * 6},${end.y * 3}`} 
                />
              </circle>
              {/* Text Label on the line */}
              <text 
                x={`${(start.x + end.x) / 2}%`} 
                y={`${(start.y + end.y) / 2 - 2}%`} 
                fill={stroke} 
                fontSize="10" 
                textAnchor="middle"
                className="font-mono font-bold"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* CSS Animation Layer for particles (fallback/enhancement) */}
      {edges.map((edge, idx) => {
         const startNode = nodes.find(n => n.id === edge.from);
         const endNode = nodes.find(n => n.id === edge.to);
         if (!startNode || !endNode) return null;
         
         const start = getPos(startNode.row, startNode.col);
         const end = getPos(endNode.row, endNode.col);
         const color = edge.color === 'emerald' ? 'bg-emerald-400' : edge.color === 'blue' ? 'bg-blue-400' : edge.color === 'red' ? 'bg-red-400' : 'bg-slate-400';
         
         return (
             <div 
                key={`p-${idx}`}
                className={`absolute w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor] z-10`}
                style={{
                    animation: `moveParticle${idx} 2s linear infinite`,
                    left: '0',
                    top: '0'
                }}
             >
                <style>{`
                    @keyframes moveParticle${idx} {
                        0% { left: ${start.x}%; top: ${start.y}%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { left: ${end.x}%; top: ${end.y}%; opacity: 0; }
                    }
                `}</style>
             </div>
         )
      })}


      {/* Nodes Layer */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute flex flex-col items-center justify-center w-24 h-20 bg-slate-800 border border-slate-600 rounded-xl shadow-lg z-20 transition-transform hover:scale-105"
          style={getNodeStyle(node.row, node.col)}
        >
          <div className="text-2xl mb-1">{node.icon || '📦'}</div>
          <div className="text-[10px] font-bold text-center text-slate-300 leading-tight px-1">
            {node.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Visualizer;