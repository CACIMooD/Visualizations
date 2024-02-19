# Data Shape Schema

## Table of Contents

* [Data Shape Schema](#data-shape-schema-file)
  * [GraphQL Types](#graphql-types)
  * [GraphQL Interfaces](#graphql-interfaces)
  * [GraphQL Directives](#graphql-directives)
  * [Examples](#examples)
    * [Schema illustrating types, interfaces and directives](#schema-illustrating-types-interfaces-and-directives)
    * [Simple tabular shape](#simple-tabular-shape)
    * [Bar or Column Chart (with grouping and stacking)](#bar-or-column-chart-with-grouping-and-stacking)
    * [Sankey Diagram](#sankey-diagram)
    * [Boston Matrix](#boston-matrix)
    * [Heatmap](#heatmap)
    * [Network Diagram](#network-diagram)

[README Data Shape Schema](../README.md#data-shape-schema)

[README](../README.md)

## Data Shape Schema File

![GraphQL](images/graphql-logo.png)

This is a GraphQL file that defines the schema that the Business Architect uses to determine what fields and series the visualization needs to render itself.  The schema details the structure of the data shape and the types needed.

### GraphQL Types

See the type definitions below:

* [GraphQL Scalar types](http://spec.graphql.org/June2018/#sec-Scalars)
* [GraphQL Object types](http://spec.graphql.org/June2018/#sec-Objects)
* [GraphQL Union types](http://spec.graphql.org/June2018/#sec-Unions)

MooD Business Architect supports some custom type extensions to GraphQL

```text
scalar Date 
scalar Colour 
scalar Shape 
scalar Image 
union Number = Int | Float 
union Any = String | Date | Number | Boolean 
```

**Note** MooD expects a type called `data` within the data shape schema. This type is used by MooD as the definition of the shape to pass data to the visualization.

**Note** MooD BA delivers Date scalar type values as a string that conforms to ISO8601, e.g. '2020-06-01T12:01:02-01:00'. [See](https://www.digi.com/resources/documentation/digidocs/90001437-13/reference/r_iso_8601_date_format.htm)

[Table of Contents](#table-of-contents)

### GraphQL Interfaces

GraphQL interfaces represent a list of named fields and their arguments. GraphQL objects can then implement these interfaces which requires that the object type will define all fields defined by those interfaces.

* [GraphQL Interfaces](http://spec.graphql.org/June2018/#sec-Interfaces)

MooD Business Architect implicitly recognises `MooDElement`. The `MooDElement` interface is for defining where the data to visualize is a set of MooD elements, e.g. from a MooD query. For example a simple tabular data visualization would have a data type that would implement and add to the MooDElement interface for values from an Element in the repository like the name or a field value.

   ```text
   interface MooDElement { 
   } 
   ```

Using the type `ID` when in the context of the MooDElement gives a unique identifier for the MooDElement (see the Simple Tabular row type example).

Another implicit interface is 'MooDMetaModel'. The 'MooDMetaModel' interface is for defining a point in your data where the MooD meta model will be output. This includes types, field and relationship information. Note that any fields defined inside the 'MooDMetaModel' interface will be ignored.

   ```text
   interface MooDMetaModel { 
   }
   
   # For example:
   type Meta implements MooDMetaModel { }
   type data { meta: Meta }
   ```

In the above example here is an extract of the JSON you will receive:

   ```JSON
 "meta": 
 {
  "aliases": [
   {
    "name": "Person", 
    "id": "00000000000000000000000000000001", 
    "type": "primary element", 
    "fields": [
     {"name": "Identifier", "id": "00000000000000000000000000000002", "type": "string", "relationship_alias_id": null},
     {"name": "PersonToTeam", "id": "00000000000000000000000000000003", "type": "relationship field", "relationship_alias_id": "00000000000000000000000000000005"}
    ], 
    "allowed_aliases": []
   },
   {
    "name": "Team", 
    "id": "00000000000000000000000000000004", 
    "type": "primary element", 
    "fields": [], 
    "allowed_aliases": []
   },
       {
    "name": "PersonToTeam", 
    "id": "00000000000000000000000000000005", 
    "type": "element relationship", 
    "fields": [], 
    "allowed_aliases": [{"name": "Team", "id": "00000000000000000000000000000004"}]
   }
  ]
 }   
```

This enables visualizations such as the one below to be created:

![MetaModel](https://user-images.githubusercontent.com/19664605/115558878-13c95100-a2ab-11eb-89fc-4c2bde4f4fc8.png)

[Table of Contents](#table-of-contents)

### GraphQL Directives

GraphQL supports directives which are used to annotate various parts of a GraphQL document as an indicator that they should be evaluated differently by a validator, executor, or client tool such as a code generator.

* [GraphQL Directives](http://spec.graphql.org/June2018/#sec-Type-System.Directives)

Types can be annotated by adding directives, these can help describe the types, and MooD understands one directive to help interpret the types for the User Interface, that is the @UI directive. It has two arguments, `name` and `default`; the `name` argument takes a string value and uses this in the data selection user interface as the name for the field instead of using the alias of the field; the `default` argument takes a typed value where the type is the same type as the field and the UI uses this as the default constant value for the field, with one exception if a field of type string is used and the default is "name" then it will default to the name of the element.

```text
directive @UI ( 
   default: Any 
   name: String 
   ) 
   on FIELD_DEFINITION
```

For example

The user interface directive is telling the UI through the `name` argument to display the name field as "Example Name" and not the field name "aliasName", and through the `default` argument to set the value on first presentation as the name of the element:

```text
type example implements MooDElement { 
   aliasName: String @UI (default: "name" name: "Example Name") 
   value: Number @UI (default: 5 name: "Example Value") 
   } 
```

[Table of Contents](#table-of-contents)

### Examples

#### Schema illustrating types, interfaces and directives

```text
# The following are predefined MooD type definitions for use along with the GraphQL predefined scalar definitions "ID", "Int", "Float", "String", and "Boolean" 
scalar Date 
scalar Colour 
scalar Shape 
scalar Image 

# Union in this case means "either", that is the value can be either an Integer (whole) or Float (fractional) number 
union Number = Int|Float 
union Any = String|Date|Number|Boolean 

# The "MooDElement" interface is used in a definition to indicate that the data should come from elements in the repository 
interface MooDElement { 
} 

# The following type definitions together are an example using some of the predefined definitions to describe the expected data structure for a visualization 
type example { 
    X: Any 
    Y: Number 

    # You can mark properties with @UI directives to change the behaviour of the UI 
    title: String! @UI (default: "Example Title") 

    # Using the UI directive default attribute populates the constant value in the UI 
    tooltip: String @UI (default: "Example Tooltip") 

    # Using the 'Name' default selects the name of the element 
    name: String! @UI (default: "Name") 

    # Using the UI directive name attribute changes the name shown in the UI for this  
    colour: Colour! @UI (default: "#FF0000", name: "Example Colour") 
    size: Int! @UI (default: 50, name: "Example Size") 

    # Date values must follow the ISO date format (that is <year>-<month>-<day>T<time>Z) 
    Z: Date @UI (default: "2020-01-30T00:00:00.0000000Z") 

    # Default the image to that of the current element (this can also be applied to types which implement MooDElement) 
    image: Image @UI(default: "self") 

    # The ability to add a heading to the UI. This does not produce any data 
    heading: Heading @UI(name:"This is some heading text which guides the user.")  
} 

# The type with name "data" is used as the root of the data definition 
type data { 
    # Square brackets indicate that the result will be a list or array of zero or more objects 
    rows: [row] 
    # An exclamation mark around a list indicates you must select at least 1 item 
    strings: [String]! 
    # An exclamation mark around a mood element list indicates you must select information from the repository 
    requiredRows: [row]! 
} 

# Inheriting from the MooDElement interface indicates a type that uses a Query or Navigator to determine its contents 
type row implements MooDElement { 
    # "ID" is a GraphQL type that means a string identifier is used, for MooD this will be a combination of the Element ID and Type and this will not appear in the UI. Use this in conjunction with actions. 
    id: ID 
    # An exclamation mark indicates that a value is required 
    name: String! 
    value: example 

    # You can specify the Image type to use the image of an element/pick item 
    image: Image 
}
```

[Table of Contents](#table-of-contents)

#### Simple tabular shape

##### Simple tabular Schema

```text
type data { 
    rows: [row!]! 
} 

type row implements MooDElement { 
    id: ID 
    name: String 
}
```

##### Simple tabular Data

```JSON
data: { 
    rows: [ 
    { id: "0", name: "One" }, 
    { id: "1", name: "Two" } 
    ] 
}
```

[Table of Contents](#table-of-contents)

#### Chart Shape

##### Chart Shape Schema

```text
type data { 
    rows: [Row!]! 
} 

type Row implements MooDElement { 
    id: ID 
    name: String 
    x: any! 
    y: any! 
}
```

##### Chart Shape Data

```JSON
data: { 
    rows: [ 
    { id: "2-", name: "One", x: 1, y: 1 }, 
    { id: "2-", name: "Two", x: 2, y: 2 }] 
}
```

[Table of Contents](#table-of-contents)

#### Bar or Column Chart (with grouping and stacking)

##### Bar or Column Chart Schema

```text
# The data type defines a little about the shape that the visualization expects; it expects the series data to be in a property called series (though this could be named anything) and it expects at least one series and at most 3 series. 
type data { 
    series: [BarSeries!]! @arrayLength(min: 1, max: 3) 
} 

# The bar series type states that each bar row item will be in an array on property "items" 
type BarSeries { 
    items: [BarItem!]! 
} 

# A bar item is the schema for each element given in the array of items. 
type BarItem implements MooDElement {     
    id: ID, 
    x: any! 
    y: number! 
    # stack series field 
    stackBy: any 
    # group series field 
    groupBy: any 
} 
```

##### Bar or Column Chart Data

Given the above schema, the data that could be produced for a chart showing the average salary (in 1,000s) per month, stacked by department and grouped by gender would be:

```JSON
data: { 
    series: [{ 
        items: [{ 
            id: "0", 
            x: "January", 
            y: 38, 
            stackBy: "IT", 
            groupBy: "Male" 
        }, { 
            id: "1", 
            x: "January", 
            y: 37, 
            stackBy: "IT", 
            groupBy: "Female" 
        }, { 
            id: "2", 
            x: "January", 
            y: 32, 
            stackBy: "HR", 
            groupBy: "Male" 
        }, { 
            id: "3", 
            x: "January", 
            y: 33, 
            stackBy: "HR", 
            groupBy: "Female" 
        }] 
    }] 
}, 
```

[Table of Contents](#table-of-contents)

#### Sankey Diagram

##### Sankey Diagram Schema

```text
type data { 
    items: [SankeyItem!]! 
} 

type SankeyItem implements MooDElement { 
    id: ID 
    label: any 
    relations: [SankeyRelation] 
} 

type SankeyRelation implements MooDElement { 
    to: ID 
    weight: number 
} 

```

##### Sankey Diagram Data

Given the above schema, a diagram showing several countries around the world and the value of trade between them, the data would look like this:

```JSON
data: { 
    items: [{ 
        id: "0", 
        label: "United Kingdom", 
        relations: [{ 
            to: "1", 
            Weight: 4.7 
        },{ 
            to: "2", 
            Weight: 8.1 
        }] 
    }, { 
        id: "1", 
        label: "Australia", 
        relations: [{ 
            to: "2", 
            Weight: 6.3 
        }] 
    }, { 
        id: "2", 
        label: "Japan" 
    }] 
}, 
```

[Table of Contents](#table-of-contents)

#### Boston Matrix

##### Boston Matrix Schema

```text
type data { 
    rows: [row!]!  
} 

type row implements MooDElement { 
    key: ID 
    label: string! 
    X: number 
    Y: number 
    Z: number 
} 
```

##### Boston Matrix Data

Given the above schema, a diagram showing several countries around the world and the values GDP, Capita and Growth etc, the data would look like this:

```JSON
data: { 
    rows: [{ 
        key: "0", 
        label: "United Kingdom", 
        X: 2.622, 
        Y: 66.1, 
        Z: 1.8 
    }, { 
        key: "1", 
        label: "Australia", 
        X: 1.323, 
        Y: 24.6, 
        Z: 2.0 
    }, { 
        key: "2", 
        label: "Japan", 
        X: 4.872, 
        Y: 126.8, 
        Z: 1.7 
    }] 
},
```

[Table of Contents](#table-of-contents)

#### Heatmap

##### Heatmap Schema

```text
type data { 
    rows: [row!]! 
} 

type row implements MooDElement { 
    id: ID 
    name: string! 
    values: [value!]! 
} 

type value implements MooDElement { 
    key: string! 
    value: any 
} 
```

##### Heatmap Data

Given the above schema, a diagram showing several countries around the world and the values GDP, Capita and Growth etc, the data would look like this:

```JSON
data: { 
    rows: [{ 
        id: "0", 
        name: "United Kingdom", 
        values: [{ 
            key: "GDP", 
            value: 2.622 
        }, { 
            key: "Population", 
            value: 66.1 
        }, { 
            key: "Growth", 
            value: 1.8 
        }] 
    }, { 
        id: "1", 
        name: "Australia", 
        values: [{ 
            key: "GDP", 
            value: 1.323 
        }, { 
            key: "Population", 
            value: 24.6 
        }, { 
            key: "Growth", 
            value: 2.0 
        }] 
    }, { 
        id: "2", 
        name: "Japan", 
        values: [{ 
            key: "GDP", 
            value: 4.872 
        }, { 
            key: "Population", 
            value: 126.8 
        }, { 
            key: "Growth", 
            value: 1.7 
        }] 
}] 

}, 
```

[Table of Contents](#table-of-contents)

#### Network Diagram

##### Network Diagram Schema

```text
type NetworkItem implements MooDElement { 
    Id: ID 
    label: any! 
    relations: [NetworkRelation] 
} 

type NetworkItems { 
    nodes: [NetworkItem!]! 
} 

type NetworkRelation implements MooDElement { 
    to: ID 
    lineWidth: Int 
} 

type data { 
    series: [NetworkItems!]! 
} 
```

##### Network Diagram Data

```JSON
data: { 
    series: [{ 
        nodes: [{ 
            id: "D0", 
            label: "IT", 
            relations: [{ 
                to: "P0", 
                lineWidth: 1 
            }, { 
                to: "P1", 
                lineWidth: 1 
            }] 
        }, { 
            id: "D1", 
            label: "HR", 
            relations: [{ 
                to: "P3", 
                lineWidth: 1 
            }] 
        }, { 
            id: "D2", 
            label: "Finance", 
            relations: [{ 
                to: "P2", 
                lineWidth: 1 
            }] 
        }] 
    }, { 
        nodes: [{ 
            id: "P0", 
            label: "Antony Bales" 
        }, { 
            id: "P1", 
            label: "Adrian Woodhouse" 
        }, { 
            id: "P2", 
            label: "Andrew Banks", 
        }, { 
            id: "P3", 
            label: "Sarah Moon", 
        }] 
    }] 
}
```

[Table of Contents](#table-of-contents)
