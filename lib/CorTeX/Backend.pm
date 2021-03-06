# /=====================================================================\ #
# |  CorTeX Framework                                                   | #
# | Backend Bridge Moduile                                              | #
# |=====================================================================| #
# | Part of the LaMaPUn project: https://trac.kwarc.info/lamapun/       | #
# |  Research software, produced as part of work done by:               | #
# |  the KWARC group at Jacobs University                               | #
# | Copyright (c) 2012                                                  | #
# | Released under the GNU Public License                               | #
# |---------------------------------------------------------------------| #
# | Deyan Ginev <d.ginev@jacobs-university.de>                  #_#     | #
# | http://kwarc.info/people/dginev                            (o o)    | #
# \=========================================================ooo==U==ooo=/ #

package CorTeX::Backend;
use warnings;
use strict;
use File::Basename;
use feature qw(switch);
use Data::Dumper;
our ($INSTALLDIR) = grep(-d $_, map("$_/CorTeX", @INC));

sub new {
  my ($class,%opts)=@_;
  $opts{verbosity}=0 unless defined $opts{verbosity};
  if ($opts{exist_url}) {
    require CorTeX::Backend::eXist;
    $opts{exist}=CorTeX::Backend::eXist->new(%opts);
    $opts{docdb} = $opts{exist};
  }
  if ($opts{sesame_url}) {
    require CorTeX::Backend::Sesame;
    $opts{sesame}=CorTeX::Backend::Sesame->new(%opts);
    $opts{metadb}=$opts{sesame};
  }

  # Fallback defaults:  
  $opts{taskdb_type} //= 'SQLite';
  require CorTeX::Backend::SQL;
  $opts{taskdb} //= CorTeX::Backend::SQL->new(%opts);

  if (! defined $opts{docdb}) {
    require CorTeX::Backend::FileSystem;
    $opts{docdb} = CorTeX::Backend::FileSystem->new(%opts);
  }

  if (! defined $opts{metadb}) {
    $opts{metadb} = CorTeX::Backend::SQL->new(
      sqldbname=>"$INSTALLDIR/MetaDB.db",
      metadb=>1,
      %opts
    );}

  bless {%opts}, $class;
}

sub exist {
  my ($self)=@_;
  $self->{exist};
}

sub sesame {
  my ($self)=@_;
  $self->{sesame};
}

sub sql {
  my ($self)=@_;
  $self->{sql};
}

sub docdb {
  my ($self)=@_;
  $self->{docdb};
}
sub metadb {
  my ($self)=@_;
  $self->{metadb};
}
sub taskdb {
  my ($self)=@_;
  $self->{taskdb};
}



1;

__END__

=pod 

=head1 NAME

C<CorTeX::Backend> - Driver for eXist and Sesame backends

=head1 SYNOPSIS

    use CorTeX::Backend;
    # Class-tuning API
    $backend=CorTeX::Backend->new(exist_url=>$exist_url,verbosity=>0|1);
    $backend->docdb->set_host($url);
    # docdb API
    my $response_bundle = $backend->docdb->query($query,keep=>0|1);
    $backend->docdb->release_result($result_id);
    my $collection = $backend->docdb->make_collection($collection);
    $backend->docdb->insert_directory($directory,$root_path);
    $backend->docdb->insert_files($directory,$collection,$root_path);
    # metadb API
    # taskdb API

=head1 DESCRIPTION

Abstract driver class supporting the various backends used by the CorTeX framework.
(currently eXist and Sesame, MySQL and SQLite)

Provides an abstraction layer and API for three logical backend applications:
- DocDB API - related to storing and querying corpora of documents
- MetaDB API - related to storing and querying collections of stand-off annotations
- TaskDB API - related to managing task queues and dependency logic 

Note on Debian prerequisites: librpc-xml-perl (eXist), ...

=head2 METHODS

=over 4

=item C<< $backend=CorTeX::Backend->new(exist_url=>$exist_url,
                                             sesame_url=>$sesame_url,verbosity=>0|1); >>

Make a new Backend object, pointing to the expected DB URLs.

=item C<< $backend->docdb->set_host($url); >>

Set a URL for querying the Document DB
 (e.g. the XML-RPC interface of the eXist XML database.)

=item C<< my $response_bundle = $backend->exist->query($query,keep=>0|1); >>

Send a query to the eXist backend. The 'keep' parameter controls if the result
  should be kept (1) or immediately discarded (0). Default is keeping the result
  set until explicitly discarded.

The returned $response_bundle is a hash reference containing three fields:
 - hits - the number of hits the query had
 - first - the first hit, if any
 - result_id - the ID of this query response, possible to use for subsequent
               refining queries

TODO: Can we reduce overhead?

=item C<< $backend->exist->release_result($result_id); >>

Clears a cached query result from the eXist DB, given by its $result_id.

=item C<< my $collection = $backend->exist->make_collection($collection); >>

Creates a new collection. If the collection already exists, the routine has no effect.

=item C<< $backend->exist->insert_directory($directory,$root_path); >>

Recursively inserts the full contents of the given $directory into eXist,
using the $root_path to calculate the relative collection name from the root /db/
collection, creating a new collection if needed.

=item C<< $backend->exist->insert_files($directory,$collection,$root_path); >>

Helper for exist->insert_directory. Inserts all resources in the given $directory
into exist, calling exist->insert_directory for help when subdirectories
are encountered.

=back

=head1 AUTHOR

Deyan Ginev <d.ginev@jacobs-university.de>

=head1 COPYRIGHT

 Research software, produced as part of work done by 
 the KWARC group at Jacobs University Bremen.
 Released under the GNU Public License

=cut
