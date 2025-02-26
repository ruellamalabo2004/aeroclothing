    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    class AddSuffixToProfilesTable extends Migration
    {
        /**
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {
            Schema::table('profiles', function (Blueprint $table) {
                $table->string('suffix', 10)->nullable()->after('last_name');
            });
        }
        

        /**
         * Reverse the migrations.
         *
         * @return void
         */
        public function down()
        {
            Schema::table('profiles', function (Blueprint $table) {
                $table->dropColumn('suffix');
            });
        }
    }
