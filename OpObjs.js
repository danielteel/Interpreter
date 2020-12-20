const Utils = require('./Utils');

const OpObjType={
	bool: Symbol("bool"),
	num: Symbol("number"),
	string: Symbol("string"),
	register: Symbol("register")
};


class OpObj {
	constructor(name="", objType=null, value=null, isConstant=false){
		this._name=name;
		this._objType=objType;
		this._value=value;
		this._isConstant=isConstant;
	}

	get name(){
		return this._name;	
	}

	get objType(){
		return this._objType;
	}

	get isConstant(){
		return this._isConstant;
	}

	get value(){
		return this._value;
	}
}

class RegisterObj extends OpObj {
	constructor(name){
		super(name, OpObjType.register, null, false);
		this._curValType=OpObjType.num;
	}

	getCopy(asNative){
		if (asNative){
			return this.getNativeObj();
		}
		let newObj=new RegisterObj(this.name+"Copy");
		newObj._curValType=this._curValType;
		newObj._value=this._value;
		newObj._isConstant=this._isConstant;
		return newObj;
	}

	setTo(obj){
		if (obj instanceof OpObj === false) throw new Error("Tried to set register to invalid type");

		if (obj._objType===OpObjType.register){
			this._curValType=obj._curValType;
		}else{
			this._curValType=obj._objType;
		}
		this._value=obj._value;
	}

	getNativeObj(){
		switch (this._curValType){
		case OpObjType.string:
			return new StringObj("",this._value, true);
		case OpObjType.bool:
			return new BoolObj("", this._value, true);
		case OpObjType.num:
			return new NumberObj("", this._value, true);
		}
	}

	eqaulTo(obj){
		return this.getNativeObj().eqaulTo(obj);
	}
	notEqualTo(obj){
		return this.getNativeObj().notEqualTo(obj);
	}
	smallerThan(obj){
		return this.getNativeObj().smallerThan(obj);
	}
	greaterThan(obj){
		return this.getNativeObj().greaterThan(obj);
	}
	smallerOrEqualThan(obj){
		return this.getNativeObj().smallerOrEqualThan(obj);
	}
	greaterOrEqualThan(obj){
		return this.getNativeObj().greaterOrEqualThan(obj);
	}
}

class BoolObj extends OpObj {
	constructor(name, initialVal=false, isConstant=false){
		super(name, OpObjType.bool, initialVal===null?null:Boolean(initialVal), isConstant);
	}
	
	static null(){
		const ret = new BoolObj(null, null, true);
		ret._value=null;
		return ret;
	}
	
	getCopy(){
		return new BoolObj(this.name, this._value, this._isConstant);
	}

	setTo(obj){
		if (this._isConstant)  throw new Error("Tried to write to constant bool");
		if (obj instanceof OpObj === false) throw new Error("Tried to set bool to invalid type");
		
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;

		if (obj._value===null && this._value!==null) return false;
		if (this._value===null && obj._value!==null) return false;

		switch (type){
		case OpObjType.bool:
			this._value=obj._value;
			break;
		case OpObjType.num:
			this._value=Boolean(obj._value);
			break;
		default:
			throw new Error("Tried to set bool to unknown type");
		}
		if (!isFinite(this._value)) this._value=null;
	}
	eqaulTo(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;

		switch (type){
		case OpObjType.bool:
			return this._value===obj._value;
		case OpObjType.num:
			return Utils.isAboutEquals(Number(this._value), obj._value);
		default:
			throw new Error("Tried to do comparison to invalid type");
		}
	}    
	notEqualTo(obj){
		return !this.eqaulTo(obj);
	}
	smallerThan(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;
		switch (type){
		case OpObjType.bool:
			return this._value<obj._value;
		case OpObjType.num:
			return Number(this._value)<obj._value;
		default:
			throw new Error("Tried to do comparison to invalid type");
		}
	}
	greaterThan(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;
		switch (type){
		case OpObjType.bool:
			return this._value>obj._value;
		case OpObjType.num:
			return Number(this._value)>obj._value;
		default:
			throw new Error("Tried to do comparison to invalid type");
		}
	}
	smallerOrEqualThan(obj){
		return this.smallerThan(obj)||this.eqaulTo(obj);
	}
	greaterOrEqualThan(obj){
		return this.greaterThan(obj)||this.eqaulTo(obj);
	}
}

class NumberObj extends OpObj {
	constructor(name, initialVal=null, isConstant=false){
		super(name, OpObjType.num,  initialVal===null?null:Number(initialVal), isConstant);
	}
	
	static null(){
		const ret = new NumberObj(null, null, true);
		ret._value=null;
		return ret;
	}
	
	getCopy(){
		return new NumberObj(this.name, this._value, this._isConstant);
	}

	setTo(obj){
		if (this._isConstant)  throw new Error("Tried to write to constant number");
		if (obj instanceof OpObj === false) throw new Error("Tried to set number to invalid type");
		
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;

		switch (type){
			case OpObjType.bool:
				this._value=Number(obj._value);
				break;
			case OpObjType.num:
				this._value=obj._value;
				break;
			default:
				throw new Error("Tried to set number to invalid type");
		}
		
		if (!isFinite(this._value)) this._value=null;
	}
	eqaulTo(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;

		if (obj._value===null && this._value!==null) return false;
		if (this._value===null && obj._value!==null) return false;
		switch (type){
			case OpObjType.bool:
				return this._value===Number(obj._value);
			case OpObjType.num:
				return Utils.isAboutEquals(this._value, obj._value);
			default:
				throw new Error("Tried to do comparison to invalid type");
		}
	}    
	notEqualTo(obj){
		return !this.eqaulTo(obj);
	}
	smallerThan(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;
		switch (type){
			case OpObjType.bool:
				return this._value<Number(obj._value);
			case OpObjType.num:
				return this._value<obj._value;
			default:
				throw new Error("Tried to do comparison to invalid type");
		}
	}
	greaterThan(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;
		switch (type){
			case OpObjType.bool:
				return this._value>Number(obj._value);
			case OpObjType.num:
				return this._value>obj._value;
			default:
				throw new Error("Tried to do comparison to invalid type");
		}
	}
	smallerOrEqualThan(obj){
		return this.smallerThan(obj)||this.eqaulTo(obj);
	}
	greaterOrEqualThan(obj){
		return this.greaterThan(obj)||this.eqaulTo(obj);
	}
}

class StringObj extends OpObj {
	constructor(name, initialVal="", isConstant=false){
		super(name, OpObjType.string,  initialVal===null?null:String(initialVal), isConstant);
	}

	static null(){
		const ret = new StringObj(null, null, true);
		ret._value=null;
		return ret;
	}

	getCopy(){
		return new StringObj(this.name, this._value, this._isConstant);
	}

	setTo(obj){
		if (this._isConstant)  throw new Error("Tried to write to constant string");
		if (obj instanceof OpObj === false) throw new Error("Tried to set string to invalid type");
		
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;

		switch (type){
			case OpObjType.string:
				this._value=obj._value;
				break;
			default:
				throw new Error("Tried to set string to invalid type");
		}
	}

	eqaulTo(obj){
		let type=obj._objType;
		if (type===OpObjType.register) type=obj._curValType;

		if (obj._value===null && this._value!==null) return false;
		if (this._value===null && obj._value!==null) return false;

		switch (type){
			case OpObjType.string:
				return this._value===obj._value;
			default:
				throw new Error("Tried to do comparison to invalid type");
		}
	}
	notEqualTo(obj){
		return !this.eqaulTo(obj);
	}
	smallerThan(obj){
		throw new Error("Tried to do invalid comparison");
	}
	greaterThan(obj){
		throw new Error("Tried to do invalid comparison");
	}
	smallerOrEqualThan(obj){
		throw new Error("Tried to do invalid comparison");
	}
	greaterOrEqualThan(obj){
		throw new Error("Tried to do invalid comparison");
	}
}

module.exports={OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj};