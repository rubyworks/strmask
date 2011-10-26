#require 'facets/functor'

class String

  # Create a mask.
  def mask(re=nil)
    Mask.new(self,re)
  end

  # = Mask
  #
  #--
  # TODO: Probably need to create a proper #hash method.
  #++
  class Mask

    # current version
    VERSION = "0.3.2"  # :erb: VERSION = "<%= version %>"

    # substitue (TODO: rename)
    ESC = "\032" # ASCII SUBSTITUTE

    def self.[](string, re=nil)
      new(string, re)
    end

    def initialize(string, re=nil)
      @to_str = string.dup
      @re     = re
      mask!(re) if re
    end

  public

    # The underlying string object.
    def to_str
      @to_str
    end

    # TODO: Should this use the escape character or not?
    def to_s
      @to_str.gsub(ESC, @re)
    end

    #
    def inspect
      @to_str.gsub(ESC, @re).inspect
    end

    #
    def [](*a)
      to_str[*a]
    end

    def mask(re)
      self.class.new(to_str,re)
    end

    def mask!(re)
      to_str.gsub!(re){ |s| ESC * s.size }
    end

    # Mask subtraction. Where the characters are the same,
    # the result is "empty", where they differ the result
    # reflects the last string.
    #
    #     "abc..123"      "ab..789."
    #   - "ab..789."    - "abc..123"
    #     ----------      ----------
    #     "....789."      "..c..123"
    #
    def -(other)
      other = convert(other)
      i = 0
      o = ''
      while i < to_str.size
        if to_str[i,1] == other[i,1]
          o << ESC
        else
          o << other[i,1]
        end
        i += 1
      end
      self.class.new(o, @re)
    end

    # Mask ADD. As long as there is a value other
    # then empty the character filters though.
    # The last to_str takes precedence.
    #
    #     "abc..123"      "ab..789."
    #   + "ab..789."    + "abc..123"
    #     ----------      ----------
    #     "abc.7893"      "abc.7123"
    #
    def +(other)
      other = convert(other)
      i = 0
      o = ''
      while i < to_str.size
        if other[i,1] == ESC
          o << to_str[i,1]
        else
          o << other[i,1]
        end
        i += 1
      end
      self.class.new(o, @re)
    end

    # Mask OR is the same as ADD.
    alias_method :|, :+

    # Mask XAND. Where the characters are the same, the
    # result is the same, where they differ the result
    # reflects the later.
    #
    #     "abc..123"      "ab..789."
    #   * "ab..789."    * "abc..123"
    #     ----------      ----------
    #     "ab..789."      "abc..123"
    #
    def *(other)
      other = convert(other)
      i = 0
      o = ''
      while i < to_str.size
        if (c = to_str[i,1]) == other[i,1]
          o << c
        else
          o << other[i,1]
        end
        i += 1
      end
      self.class.new(o, @re)
    end

    # Mask AND. Only where they are
    # then same filters through.
    #
    #     "abc..123"      "ab..789."
    #   & "ab..789."    | "abc..123"
    #     ----------      ----------
    #     "ab......"      "ab......"
    #
    def &(other)
      other = convert(other)
      i = 0
      o = ''
      while i < to_str.size
        if (c = to_str[i,1]) == other[i,1]
          o << c
        else
          o << ESC
        end
        i += 1
      end
      self.class.new(o, @re)
    end

    # Mask XOR operation. Only where there
    # is an empty slot will the value filter.
    #
    #     "abc..123"      "ab..789."
    #   | "ab..789."    | "abc..123"
    #     ----------      ----------
    #     "..c.7..3"      "..c.7..3"
    #
    def ^(other)
      other = convert(other)
      i = 0
      o = ''
      while i < to_str.size
        if to_str[i,1] == ESC
          o << other[i,1]
        elsif other[i,1] == ESC
          o << to_str[i,1]
        else
          o << ESC
        end
        i += 1
      end
      self.class.new(o, @re)
    end

    #
    def ==(other)
      case other
      when Mask
        to_str == other.to_str
      else
        to_str == other.to_s
      end
    end

    # Apply a method to the internal string and return
    # a new mask.
    def apply(s=nil, *a, &b)
      if s
        to_str.send(s,*a,&b).to_mask
      else
        @_self ||= Functor.new do |op, *a|
          to_str.send(op,*a).to_mask
        end
      end
    end

    #
    def replace(string)
      @to_str = string.to_s
    end

    #
    #def instance_delegate
    #  @to_str
    #end

    # Functor on the interal string.
    #def self
    #  @_self ||= Functor.new do |op, *a|
    #    @to_str = @to_str.send(op, *a)
    #  end
    #end

    #
    #def coerce(other)
    #  [self, other.mask(@re)]
    #end

    # Delegate any missing methods to underlying string.
    #
    def method_missing(s, *a, &b)
      begin
        to_str.send(s, *a, &b)
      rescue NoMethodError
        super(s, *a, &b)
      end
    end

    private

    def convert(other)
      case other
      when Mask
        other
      else
        self.class.new(other.to_s, @re)
      end
    end

  end

end

