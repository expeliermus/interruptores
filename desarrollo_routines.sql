-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: desarrollo
-- ------------------------------------------------------
-- Server version	5.7.33-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping routines for database 'desarrollo'
--
/*!50003 DROP PROCEDURE IF EXISTS `accionhab` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `accionhab`(
IN accion char(20),
IN hab varchar(20),
IN quien varchar(45),
IN como char(10)
)
BEGIN
  
    if( accion= 'apagar') then
		delete from dashboard where habitacion=hab;
		INSERT INTO dashboard (habitacion) values (hab);
		CALL evento(hab, 0, quien, como); 
        select mac,colordisp as color from mac,color where mac.habitacion=hab and  color.estado=1;
    end if;
    if( accion= 'apagarremoto') then
		INSERT INTO apagarremota (`habitacion`,`quien`) VALUES (hab,quien);
    end if;    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `crearCamas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `crearCamas`(
IN quien char(10)
)
BEGIN
  
    declare h varchar(20);
    
    DECLARE done INT DEFAULT FALSE;
	DECLARE cur1 CURSOR FOR select habitacion from mac where habitacion not in (select distinct habitacion from camas);
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    if( quien= 'sos') then
    OPEN cur1;
		read_loop: LOOP
			FETCH cur1 INTO h;
			IF done THEN
			  LEAVE read_loop;
			END IF;
			INSERT INTO camas (`habitacion`,`cama`) VALUES (h,1);
			INSERT INTO camas (`habitacion`,`cama`) VALUES (h,2);
		END LOOP;
		
    CLOSE cur1;
    end if;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `evento` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `evento`(
IN V_habitacion nvarchar(20),
IN V_estado smallint,
IN V_profesional nvarchar(45),
IN V_como nvarchar(20)
)
BEGIN
	/* Se corta la electricidad: en las habitaciones van a pasar sucesos indocumentados, y al reiniciar el sistemas sos registros de estado serán falsos, la estrategia es:
1) tratar las inconsistencias
2) ante una duda verificar con el dashboard que ven los usuarios(entonces la info llegará desde el mismo SP que lo alimenta)
3) codigo para resetear, para volver a un estado inicial
4) estadoactual es una ayuda para los reportes, su significado puede variar con las versiones de la aplicacion, en esta version puede valer 2, 3 4 o 5
5) la forma de saber si está cerrado es si cuandocierra no es nulo, los campos quiencierra y comocierra serán para reportes y analisis
6) no tiene apertura por cama, la unidad de medida es habitacion
no borro nulos molestos porque afectará la performance, eso lo delego a los reportes
*/
/* recibe habitacion, estado a pasar, profesional*/


declare V_id smallint ;
declare V_auxhabitacion nvarchar(45);
declare V_cuando2,V_cuando3,V_cuando4 datetime;
declare aux nvarchar(45);
/* No puede haber no puede haber mas de 1 registro ABIERTO por habitacion, el resto debe estar cerrado*/
select  habitacion ,  max(id) into V_auxhabitacion,V_id
	from sucesos where cuandocierra IS NULL
	group by habitacion 
	having count(*) >1;
if (V_id is not null ) then    
	update sucesos 
		set quiencierra='sistema',
		cuandocierra=CURRENT_TIMESTAMP,
		comocierra=concat('01 varios sucesos abiertos, se cierra éste y se deja aquel con id: ' , CAST( V_id AS CHAR))
		where habitacion =V_auxhabitacion and id != V_id and cuandocierra IS NULL;
end if;
/*en este punto del codigo, puede no haber registro de la habitacion, puede haber muchos cerrados, puede haber maximo 1 abierto*/

/* si no existe registro de la habitacion: insert,  si no:update
ANTES:  si el estado nuevo es 1-NORMAL significa que esta cerrando el estado suceso. Si no hay suceso previo (debido a corte de energia o porque ahora se esté pidiendo resetear...) no se hace nada
al hacer update, hay que ver si hubo sucesos intermedios, Ej del estado 2 puede pasar a 3 luego 4 luego 5 hasta que cierra, 
	el profesional que atiende viene junto al estado 5.
    Por lo pronto, si es update, ya existe un registro con info en suceso1 y cuando 1 */
if (left(V_como,5) = 'cobid') then
	SELECT CASE
	WHEN right(V_como,length(V_como)-5)  = 1 THEN 'Cobid atención por celular'
	WHEN right(V_como,length(V_como)-5)  = 2 THEN 'Cobid atención presencial sin tarjeta'
	END into aux;

	update sucesos 
	set quiencierra=V_profesional,
    cuandocierra=CURRENT_TIMESTAMP,
    comocierra=aux
	where cuandocierra IS NULL;
else        
    
if (V_como = 'reset') then
	update sucesos 
	set quiencierra='sistema',
    cuandocierra=CURRENT_TIMESTAMP,
    comocierra='Reset'
	where cuandocierra IS NULL;
else    
	if (V_estado = 1) then
		UPDATE sucesos 
			SET quiencierra = V_profesional,
			cuandocierra = CURRENT_TIMESTAMP,
			comocierra = V_como
			WHERE habitacion = V_habitacion and cuandocierra  IS NULL;
	else
		
		select id,cuando2,cuando3,cuando4 into V_id,V_cuando2,V_cuando3,V_cuando4 from sucesos where habitacion=V_habitacion and cuandocierra IS NULL;
			if (V_id is not null ) then
				if (V_cuando2 is null) then
					UPDATE sucesos
					SET estadoactual = V_estado,
					suceso2 = V_estado,
					cuando2 = CURRENT_TIMESTAMP,
					quienatiende = V_profesional
					WHERE id=V_id;
				else
					if (V_cuando3 is null) then
						UPDATE sucesos
						SET estadoactual = V_estado,
						suceso3 = V_estado,
						cuando3 = CURRENT_TIMESTAMP,
						quienatiende = V_profesional
						WHERE id=V_id;
					else
						if (V_cuando4 is null) then
							UPDATE sucesos
							SET estadoactual = V_estado,
							suceso4 = V_estado,
							cuando4 = CURRENT_TIMESTAMP,
							quienatiende = V_profesional
							WHERE id=V_id;
						else
							/*error
							Si llegó aqui, teniendo en cuenta que las alertas pueden subir pero no decrecer entonces de un a visita profesional pasó a alerta roja una o varias veces
							lo que aqui sabemos es que 1) no esta cerrado 2) un profesional intervino en alguno de los sucesos 3) tuvo 2 o mas alertas rojas y de ellas se registraron 1 o mas
							*/
							select 0;
						end if;
					end if;
				end if;
			else
				INSERT INTO sucesos (habitacion,estadoactual,suceso1,cuando1,quienatiende)
				VALUES (V_habitacion,V_estado,V_estado,CURRENT_TIMESTAMP,V_profesional);
			end if;
	end if;

end if;
end if;

    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `g_dashboard` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `g_dashboard`(
IN pasado smallint
)
BEGIN
declare c_ocupadas smallint;
declare c_bloqueadas smallint;
declare c_listahbloq nvarchar(50);
declare h_vacias smallint;
declare h_listavacias nvarchar(50);
declare profesionales smallint;


select count(*) into c_ocupadas from camas where length(paciente)>1;
select count(*) into c_bloqueadas from camas where paciente='@';
select count(*) into h_vacias from (select  habitacion from camas group by habitacion having max(length(paciente))<=1) as q;
select COUNT(DISTINCT nombre) into profesionales from rfid where nombre != 'desconocida' and length(nombre)>1;

SELECT  left(GROUP_CONCAT(habitacion SEPARATOR ', '),50) into h_listavacias FROM
	(select  habitacion from camas group by habitacion having max(length(paciente))<=1 order by length(habitacion),habitacion) q
	group by 'all';
SELECT  left(GROUP_CONCAT(habitacion SEPARATOR ', '),50) into c_listahbloq FROM
	(select  habitacion from camas where paciente='@'  group by habitacion order by length(habitacion),habitacion) q
	group by 'all';        
 
 select concat('{"c_ocupadas":',c_ocupadas,',"c_bloqueadas":',c_bloqueadas,',"h_vacias":',h_vacias,',"profesionales":',profesionales,',"h_listavacias":"',h_listavacias,'","c_listahbloq":"',c_listahbloq,'"}') as resultado;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `g_demoraprom` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `g_demoraprom`(
IN pasado smallint
)
BEGIN
declare alerta1 int;
declare alerta2 int;
declare alerta3 int;


select cast( avg(segundos) as UNSIGNED) into alerta1 from (
SELECT case when suceso2=5 then TIMESTAMPDIFF(SECOND,cuando1,cuando2) 
else case when suceso3=5 then TIMESTAMPDIFF(SECOND,cuando1,cuando3) 
	else TIMESTAMPDIFF(SECOND,cuando1,cuando4) end
end as segundos 
FROM sucesos where suceso1 =2 and (suceso2=5 or suceso3=5 or suceso4=5) and cuando1 > date_sub(current_date, interval pasado day) 
) as q;

select cast( avg(segundos) as UNSIGNED) into alerta2 from (
SELECT case when suceso2=5 then TIMESTAMPDIFF(SECOND,cuando1,cuando2) 
else case when suceso3=5 then TIMESTAMPDIFF(SECOND,cuando1,cuando3) 
	else TIMESTAMPDIFF(SECOND,cuando1,cuando4) end
end as segundos 
FROM sucesos where suceso1 =3 and (suceso2=5 or suceso3=5 or suceso4=5) and cuando1 > date_sub(current_date, interval pasado day) 
) as q;

select cast( avg(segundos) as UNSIGNED) into alerta3 from (
SELECT case when suceso2=5 then TIMESTAMPDIFF(SECOND,cuando1,cuando2) 
else case when suceso3=5 then TIMESTAMPDIFF(SECOND,cuando1,cuando3) 
	else TIMESTAMPDIFF(SECOND,cuando1,cuando4) end
end as segundos 
FROM sucesos where suceso1 =4 and (suceso2=5 or suceso3=5 or suceso4=5) and cuando1 > date_sub(current_date, interval pasado day) 
) as q;



        
 select concat('{"alerta1":',alerta1,',"alerta2":',alerta2,',"alerta3":',alerta3,'}') as resultado;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `g_prof_race` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `g_prof_race`(
IN pasado smallint
)
BEGIN
declare resultado MEDIUMTEXT;
declare aux varchar(10000);
declare cantX int;
declare cantY int;
declare cuantoencursor int;
declare cuantosprof int;
declare cuantopresupuesto int;
Declare cuando char(10);
DECLARE done INT DEFAULT FALSE;
DECLARE cur1 CURSOR FOR select distinct CONCAT(day(cuando1) , '/' , month(cuando1)  , ' ' , hour(cuando1) , 'hs') as cuando from sucesos where quienatiende in (select distinct nombre from rfid where nombre != 'desconocida' and nombre is not null) and cuando1 >  date_sub(current_date, interval pasado day) ;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
/*
Voy a poner un maximo para estar seguro de que no se caiga, en las pruebas de stress soportó (SP+node+grafico) una variable resultado de 185000 caracteres de largo, 
esto es 7 dias, 24hs, 70 profesionales
para predecirlo haré el calculo de cantidad de registros del cursor, que presupuesté 7d * 24hs, y cada uno tiene un peso de 374 caracteres
luego está la cantidad de profesinales involucrados y el largo de sus nombres, presupuesté 70 diferentes con largo de nombre normal dio un promedio de 600 caracteres cada uno
*/

select count(distinct CONCAT(day(cuando1) , '/' , month(cuando1)  , ' ' , hour(cuando1) , 'hs') ) into cuantoencursor from sucesos where quienatiende in (select distinct nombre from rfid where nombre != 'desconocida' and nombre is not null) and cuando1 >  date_sub(current_date, interval pasado day) ;
select count(distinct nombre) into cuantosprof from rfid r join sucesos s on r.nombre=s.quienatiende where  s.cuando1 >  date_sub(current_date, interval 7 day);
set cuantopresupuesto=cuantoencursor * 374 + cuantosprof*600;
if cuantopresupuesto > 185000 then
	select '{"25/5 18hs":[{"MAU": 10, "profesional": "Longitud excedida"}]}' as resultado;	
else
	select '{' into resultado;
	set cantX=0;
	set cantY=0;
		OPEN cur1;
			read_loop: LOOP
				FETCH cur1 INTO cuando;
				IF done THEN
				  LEAVE read_loop;
				END IF;


					select concat('"', cuando ,'":', JSON_ARRAYAGG(JSON_OBJECT('profesional',p.nombre,'MAU',COALESCE(cant,0)))) into aux
					from ( 
							select quienatiende as quien,count(*) as cant 
							from sucesos 
							where quienatiende in (select distinct quienatiende from sucesos where quienatiende is not null and length(quienatiende)>1 and cuando1 > date_sub(current_date, interval pasado day) )
							and CONCAT(day(cuando1) , '/' , month(cuando1)  , ' ' , hour(cuando1) , 'hs')=cuando
							group by quienatiende 
					) r
					 right join (select distinct nombre from rfid r join sucesos s on r.nombre=s.quienatiende where  s.cuando1 >  date_sub(current_date, interval pasado day) ) p
					on p.nombre=r.quien;
		
				select concat (resultado,aux,',') into resultado;
				
		
			END LOOP;
		   
			/*
			set cantX=cantX+1;
			select count(distinct nombre) into cantY from rfid r join sucesos s on r.nombre=s.quienatiende where  s.cuando1 >  date_sub(current_date, interval pasado day);
			select cantX as fechsa ,cantY as prof,length(resultado) as resultado;
			select concat(resultado,'}') as resultado;
			*/

			
			  
			select case when length(resultado) > 5  then  left(resultado,length(rtrim(resultado))-1)
			else  resultado end into resultado ;
			
			
			select concat(rtrim(resultado),'}') as resultado;
	END IF;            
    CLOSE cur1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `g_prof_raceBKP` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `g_prof_raceBKP`(
IN pasado smallint
)
BEGIN
declare resultado varchar(21800);
declare aux varchar(10000);
Declare cuando char(10);
DECLARE done INT DEFAULT FALSE;
DECLARE cur1 CURSOR FOR select distinct CONCAT(day(cuando1) , '/' , month(cuando1)  , ' ' , hour(cuando1) , 'hs') as cuando from sucesos where quienatiende in (select distinct nombre from rfid where nombre != 'desconocida' and nombre is not null) and cuando1 >  date_sub(current_date, interval pasado day) ;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
select '{' into resultado;
    OPEN cur1;
		read_loop: LOOP
			FETCH cur1 INTO cuando;
			IF done THEN
			  LEAVE read_loop;
			END IF;


				select concat('"', cuando ,'":', JSON_ARRAYAGG(JSON_OBJECT('profesional',p.nombre,'MAU',COALESCE(cant,0)))) into aux
				from ( 
						select quienatiende as quien,count(*) as cant 
						from sucesos 
						where quienatiende in (select distinct quienatiende from sucesos where quienatiende is not null and length(quienatiende)>1 and cuando1 > date_sub(current_date, interval pasado day) )
                        and CONCAT(day(cuando1) , '/' , month(cuando1)  , ' ' , hour(cuando1) , 'hs')=cuando
						group by quienatiende 
				) r
				 right join (select distinct nombre from rfid r join sucesos s on r.nombre=s.quienatiende where  s.cuando1 >  date_sub(current_date, interval pasado day) ) p
				on p.nombre=r.quien;
	
			select concat (resultado,aux,',') into resultado;
            
	
		END LOOP;
       
        /*
        if length(resultado) > 5 then
			select left(resultado,length(resultado)-1) into resultado ;
        end if;
      
        select length(rtrim(resultado))-1;
        */
          
        select case when length(resultado) > 5  then  left(resultado,length(rtrim(resultado))-1)
		else  resultado end into resultado ;
        
        select concat(rtrim(resultado),'}') as resultado;
    CLOSE cur1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `mantenimiento` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `mantenimiento`()
BEGIN
	delete from eventos where cuando < NOW() - INTERVAL 3 MONTH;
	delete from todo where cuando < NOW() - INTERVAL 3 MONTH;
	delete FROM rfid where nombre='desconocida';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RecibeBotonRemoto` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `RecibeBotonRemoto`(
IN V_cod char(17) ,
IN V_topico char(10),
IN V_msg1 nvarchar(12),
IN V_msg2 int,
OUT salida char(14),
OUT salida2 char(14),
OUT salida3 char(17) 
)
BEGIN
	declare V_piso char(2) default TRIM(LEADING '0' FROM right(left(V_cod,3),2)); 
    declare V_habitacion char(2) default TRIM(LEADING '0' FROM right(left(V_cod,6),2)); 
    declare V_cama char(2) default TRIM(LEADING '0' FROM right(V_cod,1));
    declare v_token int;
    declare V_auxestado  smallint default 1;
    declare V_profesional nvarchar(45) default '';
    declare V_cierre nvarchar(45) default 'tarjeta';
	declare V_macsalida char(17) default V_cod;
    declare out_number int;
    set out_number=0;

if (V_topico = 'alta' ) then
	select FLOOR(RAND() * (999999 - 100 +1)) + 100 into v_token; 
    update botonremoto set token= v_token where cod=V_cod;
    select CONCAT(c.color , ';' , v_token) as resultado, CONCAT(c.color , ';' , v_token) as resultadodisp , '0' as lamac from dashboard d join color c on c.estado=d.estado where habitacion=V_habitacion;   
	set out_number=0;
else
    
    select token into v_token from botonremoto where cod=V_cod;
    select mac into V_macsalida from mac where habitacion = V_habitacion;
    select estado into V_auxestado from dashboard where habitacion=V_habitacion; 

    if (V_topico = 'alerta' and V_msg2 = v_token) then
			update botonremoto set ultrespuesta = CURRENT_TIMESTAMP where cod=V_cod;
            update mac set ultrespuesta = CURRENT_TIMESTAMP where habitacion=V_habitacion;
            
			if (V_msg1 = 4 and V_auxestado != 4) then
				update dashboard set estado=4, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
				CALL evento(V_habitacion, 4, '', '');
				set out_number=4;
			end if;
			if (V_msg1 = 3 and (V_auxestado=2 or V_auxestado=1)) then
				update dashboard set estado=3, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
				CALL evento(V_habitacion, 3, '', '');            
				set out_number=3;
			end if;
			if (V_msg1 = 2 and V_auxestado=1) then
				update dashboard set estado=2, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
				CALL evento(V_habitacion, 2, '', '');            
				set out_number=2;
			end if;
		if (out_number = 0 ) then
			select '0' as resultado,convert(V_auxestado, char(1)) as resultadodisp,'0' as lamac from dual;
        else
			select out_number as resultado,colordisp as resultadodisp,V_macsalida as lamac from color where estado=out_number;    
		end if;
    else
		select '0' as resultado, '999' as resultadodisp,'0' as lamac  from dual;
    end if;
  
    

end if;  
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RecibeMSG` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `RecibeMSG`(
IN V_mac char(17) ,
IN V_tipo char(10),
IN V_msg nvarchar(12),
IN V_cama int,
OUT salida char(14),
OUT salida2 char(17) 
)
BEGIN
	declare V_habitacion nvarchar(20) default 'Error';
    declare V_auxestado  smallint default 1;
    declare V_profesional nvarchar(45) default '';
    declare V_cierre nvarchar(45) default 'tarjeta';
    declare V_macsalida char(17) default V_mac;
    declare out_number int;
    set out_number=0;
    
    
    update mac set ultrespuesta = CURRENT_TIMESTAMP where mac=V_mac;

/* Primero se fija si esa mac ya tiene habitacion y la pone en V_habitacion
   si no, da de alta esa mac pero volviendo a chequear que no haya una duplicada
*/    
	if exists( select 1 from mac where mac=V_mac and habitacion != 'desconocida') then
		select habitacion into V_habitacion from mac where mac=V_mac;
        select estado into V_auxestado from dashboard where habitacion=V_habitacion; 
        else
        /* error select V_mac into V_habitacion ;*/
		INSERT INTO mac (mac,habitacion)
		SELECT * FROM (SELECT V_mac, 'desconocida') AS tmp
		WHERE NOT EXISTS (
		SELECT 1 FROM mac WHERE mac = V_mac
		) LIMIT 1;
    end if;

/* ahora, hay 2 tipos de mensages a tratar, las alertas y las provenientes de un RFID
*/        
	if (V_tipo = 'alerta') then
		if (V_msg = 4 and V_auxestado != 4) then
			update dashboard set estado=4, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
            CALL evento(V_habitacion, 4, '', '');
            set out_number=4;
		end if;
		if (V_msg = 3 and (V_auxestado=2 or V_auxestado=1)) then
			update dashboard set estado=3, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
            CALL evento(V_habitacion, 3, '', '');            
            set out_number=3;
		end if;
        if (V_msg = 2 and V_auxestado=1) then
			update dashboard set estado=2, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
            CALL evento(V_habitacion, 2, '', '');            
            set out_number=2;
		end if;
	end if;
 
/* Para las rfid indispensable verificar que es una asignada a un profesional y va en V_profesional, sino darla de alta
	en enfermeria puede haber un lector rfid. todo es distinto desde él, chequea en apagarremota si hay alguna habitacion para apagar
    si no es de enfermeria es de habitacion. la pasa a estado 5 (azul) salvo que ya esté en el, y entonces lo apaga
*/   	
if (V_tipo = 'rfid') then
if not exists( select 1 from rfid where rfid=V_msg and nombre != 'desconocida' ) then
	INSERT INTO rfid (rfid,nombre)
	SELECT * FROM (SELECT V_msg, 'desconocida') AS tmp
	WHERE NOT EXISTS (
		SELECT 1 FROM rfid WHERE rfid = V_msg
	) LIMIT 1;
else     
	SELECT nombre into V_profesional FROM rfid where rfid=V_msg;

    if (V_habitacion = 'enfermeria' ) then
       /*primero se pide apagar la hab en forma remota y se tien e 30 segundos para pasar la tarjeta*/
	   if exists( select 1 from apagarremota where cuando >  NOW() - INTERVAL 30 SECOND ) then 
			select habitacion into V_habitacion from apagarremota order by cuando desc LIMIT 1;
            select mac into V_macsalida from mac where habitacion = V_habitacion;
            set V_cierre = 'tarjeta remota';
            SELECT nombre into V_profesional FROM rfid where rfid=V_msg and nombre != 'desconocida';
            /* ahora ejecuta un resumende lo que haría una tarjeta en situacion normal solo que está puesto que finalmente cierre la alerta*/
	        select estado into V_auxestado from dashboard where habitacion=V_habitacion;            
            if ( V_auxestado != 5) then
				update dashboard set estado=5,profesional=V_profesional,DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
				CALL evento(V_habitacion, 5, V_profesional, V_cierre); 
			end if;
            update dashboard set estado=1,profesional='',cama=0,DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
			CALL evento(V_habitacion, 1, V_profesional, V_cierre);
            set out_number=1;
            truncate table apagarremota;
            set  V_habitacion='enfermeria';
       end if;
	else
	   select estado into V_auxestado from dashboard where habitacion=V_habitacion;
		if ( V_auxestado = 5) then
			update dashboard set estado=1,profesional='',cama=0,DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
			CALL evento(V_habitacion, 1, V_profesional, V_cierre);
			set out_number=1;
		else
			update dashboard set estado=5,profesional=V_profesional,DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
			CALL evento(V_habitacion, 5, V_profesional, V_cierre);
			set out_number=5;
		end if;
        
	end if;
end if;
end if;    
/* Finalmente devuelve el color que otorgó
*/ 
    if (out_number = 0) then
		select '0' as resultado;
    else
		select colordisp as resultado,V_macsalida as lamac from color where estado=out_number;
	end if;
  
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RecibeMSGremoto` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `RecibeMSGremoto`(
IN V_habitacion char(2) ,
IN V_accion char(10),
IN V_cama int ,
OUT salida char(14)
)
BEGIN

declare V_mac char(17) ;
declare V_tipo char(10);



    declare V_auxestado  smallint default 1;
    declare V_profesional nvarchar(45) default '';
    declare V_cierre nvarchar(45) default 'tarjeta';
    declare out_number int;
    set out_number=0;

    
	UPDATE `mac` SET `ultrespuesta` = now();
    	   select estado into V_auxestado from dashboard where habitacion=V_habitacion;
    
	
		if (V_accion = 4 and V_auxestado != 4) then
			update dashboard set estado=4, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
            CALL evento(V_habitacion, 4, '', '');
            set out_number=4;
		end if;
		if (V_accion = 3 and (V_auxestado=2 or V_auxestado=1)) then
			update dashboard set estado=3, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
            CALL evento(V_habitacion, 3, '', '');            
            set out_number=3;
		end if;
        if (V_accion = 2 and V_auxestado=1) then
			update dashboard set estado=2, cama=V_cama,profesional='',DESDE=CURRENT_TIMESTAMP where habitacion=V_habitacion;
            CALL evento(V_habitacion, 2, '', '');            
            set out_number=2;
		end if;

    
	
    
    if (out_number = 0) then
		select '0' as resultado;
    else
		select colordisp as resultado from color where estado=out_number;
	end if;
  
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `reiniciar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`frombakend`@`localhost` PROCEDURE `reiniciar`(
IN quien char(10)
)
BEGIN
    declare x INT;
    declare h varchar(20);
    DECLARE done INT DEFAULT FALSE;
	DECLARE cur1 CURSOR FOR select habitacion from mac;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    if( quien= 'sos') then
    OPEN cur1;
		read_loop: LOOP
			FETCH cur1 INTO h;
			IF done THEN
			  LEAVE read_loop;
			END IF;
			delete from dashboard where habitacion=h;
			INSERT INTO dashboard (habitacion) values (h);
		END LOOP;
		CALL evento(h, 0, '', 'reset'); 
    CLOSE cur1;
    end if;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-19 16:17:20
