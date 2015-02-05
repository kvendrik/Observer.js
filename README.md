Not browser tested yet, but let me know what you think. :)

## Usage

### Simple
##### Basic usage example.

1. Create a new `Observer` instance <br>`var obj = new Observer({ name: 'Koen', age: 19 });`
2. Use its awesomeness:
```
obj.on('change', function(details){
   //any change
   console.log(details);
})
.on('update', function(details){
   //updates
   console.log(details);
})
.on('add', function(details){
   //additions
   console.log(details);
})
.on('delete', function(details){
   //delete
   console.log(details);
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

## Tips & Tricks
Next to all the two-way data binding awesomeness Observer brings there are also some other neat tricks I like to use Observer for.

### Path checking
Using the `get` method you can easily check if a deeply nested property exists.

So instead of:
```
if(obj.favorites && obj.favorites.friends && obj.favorites.friends.count)
```

you can use:
```
if(obj.get('favorites.friends.count'))
```

### Quickly setting deep properties
When using the `set` method Observer will create an empty object for any part of the path that doesn't exists yet.

So say you have this object:
```
var obj = new Observer({});
```

and then you run:
```
obj.set('favorites.friends.count', 248);
```

the object will then look like:
```
{
    favorites: {
        friends: {
            count: 248
        }
    }
}
```
