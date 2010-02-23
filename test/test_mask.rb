require 'test/unit'
require 'mask'

class TestMask < Test::Unit::TestCase

  def setup
    @x1 = String::Mask["abc..123", '.']
    @x2 = String::Mask["ab..789.", '.']
  end

  def test_sub
    r = @x1 - @x2
    a = String::Mask["....789.", '.']
    assert_equal(a, r)

    r = @x2 - @x1
    a = String::Mask["..c..123", '.']
    assert_equal(a, r)
  end

  def test_add
    r = @x1 + @x2
    a = String::Mask["abc.7893", '.']
    assert_equal(a, r)

    r = @x2 + @x1
    a = String::Mask["abc.7123", '.']
    assert_equal(a, r)
  end

  def test_xand
    r = @x1 * @x2
    a = String::Mask["ab..789.", '.']
    assert_equal(a, r)

    r = @x2 * @x1
    a = String::Mask["abc..123", '.']
    assert_equal(a, r)
  end

  def test_and
    r = @x1 & @x2
    a = String::Mask["ab......", '.']
    assert_equal(a, r)

    r = @x2 & @x1
    a = String::Mask["ab......", '.']
    assert_equal(a, r)
  end

  def test_xor
    r = @x1 ^ @x2
    a = String::Mask["..c.7..3", '.']
    assert_equal(a, r)

    r = @x2 ^ @x1
    a = String::Mask["..c.7..3", '.']
    assert_equal(a, r)
  end

end


