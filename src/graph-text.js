/**
 * Utilities for handling graph text
 */

function isUpperCase(char) {
 return (char >= 'A' && char <= 'Z'); // is this locale safe?
}

function splitByLengthAndCamelOrWord(text) {
  for (var i = 0; i < text.length; i++) {
    if (i > 0)
      if ((!isUpperCase(text.charAt(i-1)) && isUpperCase(text.charAt(i))) || // camel case transition
         text.charAt(i-1) === ' ')                                           // new word
            if (i > 3)
               return [text.slice(0, i)].concat(splitByLengthAndCamelOrWord(text.slice(i)));

     if (i === text.length-1) {
       return [text];
     }
   }
 }

export function formattedText(node) {
  var text = [],
    splitName = splitByLengthAndCamelOrWord(node.displayName);

  console.log('*** formattedText: ' + node.displayName);

  splitName.forEach(function(line) {
   text.push(line);
  });

   return text;
 }

export function calcBBox(svgText, node) {
  // if (!svgText) {
  //   debugger;
  // }
  svgText.selectAll('tspan').remove();
  // if (!node) {
  //   debugger;
  // }
  formattedText(node).forEach(line => {
    svgText.append('tspan')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('dy', '1.2em')
      .text(line);
  });
  return svgText.node().getBBox();
}
