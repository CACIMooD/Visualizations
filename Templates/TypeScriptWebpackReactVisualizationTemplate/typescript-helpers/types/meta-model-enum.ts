/**
 * Used by MooD Meta Model fields to determine their type
 */
export enum MooDMetaModelFieldType {
  boolean = "true/false",
  date_and_time = "date and time",
  feature = "feature",
  formatted_text_field = "formatted text field",
  fractional_number = "fractional number",
  pick_list = "pick list",
  relationship_field = "relationship field",
  string = "string",
  whole_number = "whole number",
}

/**
 * Used by MooD Meta Model aliases to determine their types
 */
export enum MooDMetaModelAliasType {
  attribute = "attribute",
  element_relationship = "element relationship",
  data_row = "data row",
  epoch = "epoch",
  feature = "feature",
  group = "group",
  object = "object",
  primary_element = "primary element",
  process = "process",
  service = "service",
  state = "state",
  user = "user",
}
