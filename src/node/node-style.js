import d3 from 'd3';

/**
 * Determine node fill color based on kind.
 * Color values ported from legacy, but doesn't have to be d3.
 */
export function fillColor(node) {
  if (node.kind === 'trait')           return d3.rgb('blue').darker(2);
  if (node.kind === 'class')           return d3.rgb('blue').brighter(1);
  if (node.kind === 'object')          return d3.rgb('blue').brighter(1.6);
  if (node.kind === 'anonymous class') return d3.rgb('gray').brighter(0.9);
  if (node.kind === 'method')
    if (node.name.indexOf('$') > 0)   return d3.rgb('gray').brighter(0.9);
    else                              return d3.rgb('green');
  if (node.kind === 'constructor') {
    return 'url(#MyRadialGradientDef)';
  }
  if (node.kind === 'value')           return d3.rgb('green').brighter(1.3);
  if (node.kind === 'package')         return d3.rgb('white').darker(2);
}
