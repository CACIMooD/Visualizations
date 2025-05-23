import { MooDMetaModelAliasType, MooDMetaModelFieldType } from "./meta-model-enum";

declare global {
  /**
   * Used by MooD to determine that the variable being passed is a MooD Meta Model
   */
  interface MooDMetaModel {
    aliases: MooDMetaModelAlias[];
  }

  /**
   * Used by MooD Meta Models to store meta data
   */
  type MooDMetaModelAlias = {
    name: string;
    id: string;
    type: MooDMetaModelAliasType;
    fields: MooDMetaModelField[];
    allowed_aliases: MooDMetaModelAllowedAlias[];
  };

  /**
   * Used by MooD Meta Models to store the individual alias field data
   */
  type MooDMetaModelField = {
    name: string;
    id: string;
    type: MooDMetaModelFieldType;
    relationship_alias_id: string | null;
  };

  /**
   * USed by MooD Meta Models to store the allowed aliases
   */
  type MooDMetaModelAllowedAlias = {
    name: string;
    id: string;
  };
}