export class GraphTextService {

  constructor() {
    this.verticalOffset = '1.2em';
  }

  isUpperCase(char) {
   return (char >= 'A' && char <= 'Z'); // is this locale safe?
  }

  splitByLengthAndCamelOrWord(text) {
    for (let i = 0; i < text.length; i++) {
      if (i > 0)
        if ((!this.isUpperCase(text.charAt(i-1)) && this.isUpperCase(text.charAt(i))) || // camel case transition
           text.charAt(i-1) === ' ')                                           // new word
              if (i > 3)
                 return [text.slice(0, i)].concat(this.splitByLengthAndCamelOrWord(text.slice(i)));

       if (i === text.length-1) {
         return [text];
       }
     }
   }

  formattedText(node) {
    let text = [],
      splitName = this.splitByLengthAndCamelOrWord(node.displayName);

    splitName.forEach( (line, index) => {
     text.push({
       line: line,
       x: 0,
       dy: index === 0 ? '0' : this.verticalOffset
     });
    });

    return text;
   }

}
