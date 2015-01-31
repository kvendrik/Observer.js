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
##### Working with nested objects and brace expansions
```
var obj = new Observer({
    name: {
        first: 'Koen',
        last: 'Vendrik'
    },
    favorites: {
        first: 'JavaScript',
        second: 'Ruby',
        third: 'Python',
        fourth: 'SASS',
        fifth: 'Java'
    },
    age: 19,
    city: {
        nijmegen: {
            province: {
                name: 'Gelderland',
                abbreviation: 'GL'
            },
        }
    }
});

obj.on('change', function(changes){
    console.log(changes);
});

obj[0].name.on('change', function(changes){
    console.log('Name change: '+JSON.stringify(changes));
});

obj.set({ age: 20 });
obj.set({ 'name.first': 'Matti' });
obj.set({ 'favorites.{first,second}', 'SASS' });
obj.set({
    favorites: {
        first: 'SASS'
    }
});

obj.get('favorites.{first..fifth}');
//["JavaScript", "Ruby", "Python", "SASS", "Java"]

obj.get('favorites.{first,fifth}');
//["JavaScript", "Java"]
```