/**
 * Used by MooD to determine that the variable being passed is a MooD Element
 */
interface MooDElement {
  key: string;
}

/**
 * Used by MooD to determine the element inside MooD
 */
type ID = string;

/**
 * Used by MooD to pass colours to/from the visualisation
 */
type Color = (string & { __brand: "Color" }) | Colour;

/**
 * Used by MooD to pass colours to/from the visualisation
 */
type Colour = string & { __brand: "Colour" };

/**
 * Used by MooD to pass shapes to/from the visualisation
 */
type Shape = string & { __brand: "Shape" };

/**
 * Used by MooD to pass single Color/Shape as input/output
 *
 *  This type is passed as #223344
 */
type SinglePickList = Color | Shape;

/**
 * Used by MooD to pass multiple Color/Shape as inputs/outputs
 *
 *  This type is passed a optional CSV:
 *
 *  #223344,#667788
 */
type MultiPickList = Color | Shape;

/**
 * Used by MooD to pass images to/from the visualisation
 */
type Image = string;

/**
 * Used by MooD to pass dates to/from the visualisation
 *
 * Note MooD BA delivers Date scalar type values as a string that conforms to ISO8601, e.g. '2020-06-01T12:01:02-01:00'.
 */
type MooDDate = string;

/**
 * Used by MooD to pass dates to/from the visualisation
 *
 * Values for the "elements" type may be a single element unique id string,
 * a comma separated list of unique ids or an array of unique ids representing the element instances
 */
type Elements = (string | string[]) & { __brand: "Elements" };

/**
 * Used by MooD to allow any type of variable to be passed in/out
 */
type Any = boolean | number | string | MooDDate;
