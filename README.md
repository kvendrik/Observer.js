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
    age: 19,
    city: 'Nijmegen',
    favorites: {
        posts: {
            recent: {
                friends: {
                    robert: {
                        age: 20
                    }
                },
                others: {
                    matti: {
                        age: 19
                    }
                }
            }
        }
    }
});

obj.on('change', function(changes){
    console.log(changes);
});

obj.set('age', 20);
obj.set('name.first', 'Matti');
obj.set('favorites.{first,second}', 'SASS');
obj.set({
    favorites: {
        first: 'SASS'
    }
});

obj.get('favorites.posts.recent.friends');
//{ robert:{ age: 20 } }

obj.get('favorites.posts.recent.{friends,others}');
//[{ robert: { age: 20 } }, { matti: { age: 19 } }]
```