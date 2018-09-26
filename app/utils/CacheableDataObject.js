export default class CacheableDataObject
{
	constructor(data){
		this.beforeConstruct();
		this.update(data);
		this.afterConstruct();
	}

	beforeConstruct(){}
	afterConstruct(){}
	beforeUpdate(){}
	afterUpdate(){}

	static create(data){
		return this.newInstance().update(data);
	}

	update(data){
		if(this.beforeUpdate(data) === false)
		{
			return this;
		}
		for(let i in data){
			if(!data.hasOwnProperty(i))
			{
				continue;
			}
			if(this.dataLocationParsers[i])
			{
				this.dataLocationParsers[i].call(this, this, data);//BABEL fucks up binding "this" to the function
			}
			else
			{
				this[i] = data[i];
			}
		}
		this.afterUpdate(data);
		return this;
	}

	static retrieveById(id){
		//TODO: Update this to be able to use dynamic id fields
		return this.retrieve({id: id});
	}

	serialize(){
		const data = {};
		for(let field of this.serializeFields){
			data[field] = this[field];
		}
		return data;
	}

	static retrieve(data, idToSave){
		let className = this.name;
		let id = null;

		if(idToSave)
		{
			id = idToSave;
		}
		else
		{
			id = data.id;
		}
		if(!CacheableDataObject.cache[className])
		{
			CacheableDataObject.cache[className] = {};
		}
		if(CacheableDataObject.cache[className][id])
		{
			if(CacheableDataObject.cache[className][id] === data)
			{
				return data;
			}
			return CacheableDataObject.cache[className][id].update(data);
		}
		else
		{
			let newInstance = this.create(data);
			if(id)
			{
				CacheableDataObject.cache[className][id] = newInstance;
			}
			return newInstance;
		}
	}

	static newInstance(data){
		return new this(data);
	}
}
CacheableDataObject.cache = {};
CacheableDataObject.prototype.dataLocationParsers = {

};
CacheableDataObject.prototype.serializeFields = [];
