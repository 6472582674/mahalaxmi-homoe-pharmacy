module {
  type OldState = {
    // legacy persistent actors had empty content
  };

  type NewState = {
    // empty migration to persist actor state
  };

  public func run(_old : OldState) : NewState {
    // No migration steps needed - persistent actor after migration will contain empty content
    {};
  };
};

