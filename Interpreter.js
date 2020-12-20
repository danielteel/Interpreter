const Utils = require('./Utils');
const {OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj, Machine}=require('./OpObjs');

const Tokenizer = require('./Tokenizer');
const {Parser, IdentityType} = require('./Parser');
const {Program} = require('./Program');


class Interpreter {
    constructor(){
    }

    static funcDef(name, func, returnType, ...params){
        let builtDef={};

        builtDef.name=name;
        builtDef.func=func;
        builtDef.params=[];

        let type=returnType.toLowerCase().trim();
        switch (type){
            case "bool":
                builtDef.type=IdentityType.BoolFunction;
                break;
            case "double":
                builtDef.type=IdentityType.DoubleFunction;
                break;
            case "string":
                builtDef.type=IdentityType.StringFunction;
                break;
            default:
                throw Error("Invalid func return type: '"+returnType+"', it can be bool, double, or string.");
        }

        for (let i=0;i<params.length;i++){
            type=params[i].toLowerCase().trim();
            switch (type){
                case "bool":
                    builtDef.params.push(IdentityType.Bool);
                    break;
                case "double":
                    builtDef.params.push(IdentityType.Double);
                    break;
                case "string":
                    builtDef.params.push(IdentityType.String);
                    break;
                default:
                    throw Error("Invalid func parameter type: '"+type+"', it can be bool, double, or string.");
            }
        }
        
        return builtDef;
    }

    runCode(code, ...externals){
        let tokenizer=new Tokenizer(code);
        let errorRecvd=tokenizer.tokenize();

        if (errorRecvd!==null){
            console.log("Error during tokenization on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        const parserExternList=[];
        const executeExternList=[];
        if (externals){
            for (let i=0;i<externals.length;i++){
                if (externals[i] instanceof StringObj){
                    parserExternList.push({name: externals[i].name, type: IdentityType.String});
                    executeExternList.push(externals[i]);
                }else if (externals[i] instanceof NumberObj){
                    parserExternList.push({name: externals[i].name, type: IdentityType.Double});
                    executeExternList.push(externals[i]);
                }else if (externals[i] instanceof BoolObj){
                    parserExternList.push({name: externals[i].name, type: IdentityType.Bool});
                    executeExternList.push(externals[i]);
                }else{            
                    parserExternList.push(externals[i]);
                    executeExternList.push(externals[i].func);
                }
            }
        }

        let parser=new Parser(tokenizer.tokens);
        const program=parser.parse(parserExternList);//[ {name: "ret", type: IdentityType.String}, {name: "print", type: IdentityType.BoolFunction, params:[IdentityType.String]} ]);
        if (!(program instanceof Program)){
            errorRecvd = program;
            console.log("Error during parse on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        errorRecvd=program.link();
        if (errorRecvd){
            console.log("Error during link: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        let exitObject=program.execute(executeExternList);
        if (!(exitObject instanceof OpObj)){
            errorRecvd=exitObject;
            console.log("Error at opcode address="+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        console.log("Exit value:"+exitObject.value);
        return exitObject;
    }
}





//Example usage below
function print(popFn){
    let str=popFn();

    console.log(str.value);
    return new BoolObj(null, true, false);
}

const code=`
    this=this+1;
    print(tostring(this,null));
`;

let importThis = new NumberObj("this", 17, false);

let interpreter=new Interpreter();

interpreter.runCode( 
                    code,                                                   //The code to run
                    importThis,                                             //Importing a string variable
                    Interpreter.funcDef("print", print, "bool", "string"),  //importing print (returns a bool, accepts a string)
                   );

console.log("importThis.value = "+importThis.value);


module.exports=Interpreter;

