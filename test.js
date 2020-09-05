'use strict'

const pastemystJs = require('./index'); // Error without the ;

(async function() {
    const code = `public class TestClass {
        
        public void TestMethod() {
            Constole.WriteLine("This is a Test");
        }
    }`;
    const language = 'csharp';
    const expiresIn = '1h';

    const postResponse = await pastemystJs.createPasteMyst(code, expiresIn, language);
    console.log('postResponse');
    console.log(postResponse);

    const getResponse = await pastemystJs.getPasteMyst(postResponse.id);
    console.log('getResponse');
    console.log(getResponse);
})();