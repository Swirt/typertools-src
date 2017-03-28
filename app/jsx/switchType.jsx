function switchType() {
	var idsetd = charIDToTypeID( "setd" );
		var desc25 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
			var ref2 = new ActionReference();
			var idPrpr = charIDToTypeID( "Prpr" );
			var idTEXT = charIDToTypeID( "TEXT" );
			ref2.putProperty( idPrpr, idTEXT );
			var idTxLr = charIDToTypeID( "TxLr" );
			var idOrdn = charIDToTypeID( "Ordn" );
			var idTrgt = charIDToTypeID( "Trgt" );
			ref2.putEnumerated( idTxLr, idOrdn, idTrgt );
		desc25.putReference( idnull, ref2 );
		var idT = charIDToTypeID( "T   " );
		var idTEXT = charIDToTypeID( "TEXT" );
		var idPnt = charIDToTypeID( "Pnt " );
		desc25.putEnumerated( idT, idTEXT, idPnt );
	executeAction( idsetd, desc25, DialogModes.NO );

	var idsetd = charIDToTypeID( "setd" );
		var desc26 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
			var ref3 = new ActionReference();
			var idPrpr = charIDToTypeID( "Prpr" );
			var idTEXT = charIDToTypeID( "TEXT" );
			ref3.putProperty( idPrpr, idTEXT );
			var idTxLr = charIDToTypeID( "TxLr" );
			var idOrdn = charIDToTypeID( "Ordn" );
			var idTrgt = charIDToTypeID( "Trgt" );
			ref3.putEnumerated( idTxLr, idOrdn, idTrgt );
		desc26.putReference( idnull, ref3 );
		var idT = charIDToTypeID( "T   " );
		var idTEXT = charIDToTypeID( "TEXT" );
		var idbox = stringIDToTypeID( "box" );
		desc26.putEnumerated( idT, idTEXT, idbox );
	executeAction( idsetd, desc26, DialogModes.NO );
}