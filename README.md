Not browser tested yet, but let me know what you think. :)

## Usage

### Simple
##### Basic usage example.
```
var obj = new Observer({ name: 'Koen', age: 19 })
.on('change', function(changes){
   console.log('Changes: '+JSON.stringify(changes));
})
.on('update', function(changes){
   console.log('Updates: '+JSON.stringify(changes));
})
.on('add', function(changes){
   console.log('Additions: '+JSON.stringify(changes));
})
.on('delete', function(changes){
   console.log('Deleted: '+JSON.stringify(changes));
})
.set({ name: 'John', age: 20, city: 'Nijmegen' })
.set('name', 'Doe')
.delete('name', 'age');
```

### Advanced
##### Working with nested objects
```
var obj = new Observer({
  name: new Observer({ first: 'Koen', last: 'Vendrik' }),
  age: 19,
  city: 'Nijmegen'
});

obj.on('change', function(changes){
  console.log(changes);
});

obj[0].name.on('change', function(changes){
  console.log('Name change: '+JSON.stringify(changes));
});

obj.set({ age: 20 });
obj[0].name.set({ first: 'Matti' });
```